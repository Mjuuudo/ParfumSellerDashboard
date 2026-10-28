import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { and } from "@prisma/orm-postgres/orm-client";
import { Temporal } from "temporal-polyfill";
import { db } from "../prisma/db.js";
import { OrderCreationDto } from "./dto/createOrder.dto.js";
import { OrderListQueryDto } from "./dto/listOrders.dto.js";
import {
    allocate,
    requiredAmount,
    totalAvailable,
    unitPriceFor,
    type SellingType,
    type StockSource,
} from "./order.allocation.js";


// The user decoded by AuthGuard (request.user).
export type ActingUser = {
    userId: number;
    username: string;
    role: string;
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const INT = 'pg/int4@1';
const TEXT = 'pg/text@1';

// Postgres error codes worth retrying: serialization failure and deadlock.
const RETRYABLE_SQL_STATES = new Set(['40001', '40P01']);
const MAX_ATTEMPTS = 3;

function sqlStateOf ( error: unknown ): string | undefined {
    if (!error || typeof error !== 'object') return undefined;
    const e = error as { sqlState?: string; code?: string; cause?: { sqlState?: string; code?: string } };
    return e.sqlState ?? e.cause?.sqlState ?? e.cause?.code ?? e.code;
}

// Runs a transaction again when Postgres aborted it because of a deadlock / serialization conflict.
// Business errors (NestJS HttpExceptions) are never retried.
async function withRetry<T> ( work: () => Promise<T> ): Promise<T> {
    for (let attempt = 1; ; attempt++) {
        try {
            return await work();
        } catch (error) {
            const state = sqlStateOf(error);
            if (attempt < MAX_ATTEMPTS && state && RETRYABLE_SQL_STATES.has(state)) {
                await new Promise((resolve) => setTimeout(resolve, 25 * attempt));
                continue;
            }
            throw error;
        }
    }
}

const SELLING_TYPE_LABELS: Record<SellingType, string> = {
    COMPLETE: 'complete bottle',
    DECANT_10ML: '10 ml decant',
    DECANT_20ML: '20 ml decant',
};

const userSummary = ['id', 'username', 'firstName', 'lastName'] as const;


@Injectable()
export class OrderService {


    // ── Create + reserve ────────────────────────────────────────────────────────────────

    // Creates the order, its items and one StockReservation per stock source used, and raises
    // StockBatch.reservedQuantity / DecantBottle.reservedVolumeMl — all in ONE transaction.
    // Physical stock (unusedQuantity / remainingVolumeMl) is NOT touched here: that happens on confirmation.
    // If any line can't be fully covered, nothing is written and a 409 lists every shortage.
    async createOrder ( data: OrderCreationDto, user: ActingUser ) {
        const customer = await db.orm.public.Customer.where({ id: data.customerId }).first();
        if (!customer) {
            throw new NotFoundException(`Customer Not Found !`);
        }
        if (!customer.isActive) {
            throw new BadRequestException(`This customer is inactive: reactivate them before creating an order.`);
        }

        // Every perfume must exist and be active; prices are read from here, never from the client.
        const parfumIds = [...new Set(data.items.map((item) => item.parfumId))].sort((a, b) => a - b);
        const parfums = await db.orm.public.Parfum
            .where((p) => p.id.in(parfumIds))
            .include('brand', (brand) => brand.select('name'))
            .all();
        const parfumById = new Map(parfums.map((parfum) => [parfum.id, parfum]));

        for (const parfumId of parfumIds) {
            const parfum = parfumById.get(parfumId);
            if (!parfum) throw new NotFoundException(`Perfume #${parfumId} Not Found !`);
            if (!parfum.isActive) throw new BadRequestException(`"${parfum.name}" is inactive and can't be ordered.`);
        }

        const orderId = await withRetry(() => db.transaction(async (tx) => {
            // 1. Lock the candidate stock rows (FOR UPDATE) and read their CURRENT availability.
            //    Perfumes are processed in id order and rows in id order, so concurrent orders lock in the same order.
            const batchesByParfum = new Map<number, StockSource[]>();
            const bottlesByParfum = new Map<number, StockSource[]>();

            for (const parfumId of parfumIds) {
                const types = new Set(data.items.filter((item) => item.parfumId === parfumId).map((item) => item.sellingType));

                if (types.has('COMPLETE')) {
                    const rows = await tx.query(
                        db.raw.sql`SELECT "id", "unusedQuantity" - "reservedQuantity" AS "available"
                                   FROM "StockBatch" WHERE "parfumId" = ${parfumId}
                                   ORDER BY "receivedAt", "id" FOR UPDATE`
                            .returnsRow({ id: INT, available: INT }).build(),
                    );
                    batchesByParfum.set(parfumId, rows.map((row) => ({ id: row.id, available: row.available })));
                }

                if (types.has('DECANT_10ML') || types.has('DECANT_20ML')) {
                    const rows = await tx.query(
                        db.raw.sql`SELECT "id", "remainingVolumeMl" - "reservedVolumeMl" AS "available"
                                   FROM "DecantBottle" WHERE "parfumId" = ${parfumId} AND "isActive" = true
                                   ORDER BY "createdAt", "id" FOR UPDATE`
                            .returnsRow({ id: INT, available: INT }).build(),
                    );
                    bottlesByParfum.set(parfumId, rows.map((row) => ({ id: row.id, available: row.available })));
                }
            }

            // 2. Allocate every line. Sources are shared objects, so two lines of the same perfume
            //    can't both count the same bottle / millilitres.
            const shortages: string[] = [];
            const plans = data.items.map((item, index) => {
                const parfum = parfumById.get(item.parfumId)!;
                const sources = (item.sellingType === 'COMPLETE' ? batchesByParfum : bottlesByParfum).get(item.parfumId) ?? [];
                const required = requiredAmount(item.sellingType, item.quantity);
                const allocations = allocate(required, sources);

                if (!allocations) {
                    const available = totalAvailable(sources);
                    const unit = item.sellingType === 'COMPLETE' ? 'sealed bottle(s)' : 'ml';
                    shortages.push(
                        `Line ${index + 1} (${parfum.name}, ${item.quantity} × ${SELLING_TYPE_LABELS[item.sellingType]}): ` +
                        `needs ${required} ${unit}, only ${available} ${unit} available.`,
                    );
                    return null;
                }

                for (const allocation of allocations) {
                    const source = sources.find((candidate) => candidate.id === allocation.id)!;
                    source.available -= allocation.amount;
                }

                const unitPrice = unitPriceFor(item.sellingType, parfum);
                return { item, unitPrice, allocations };
            });

            if (shortages.length) {
                // Throwing rolls the whole transaction back: no partial reservation is ever kept.
                throw new ConflictException({
                    statusCode: 409,
                    error: 'Insufficient Stock',
                    message: shortages,
                });
            }

            // 3. Write the order, its items, the reservations, and raise the reserved counters.
            const order = await tx.orm.public.Order.create({
                deliveryAdress: data.deliveryAdress?.trim() || customer.address,
                deliveryPrice: data.deliveryPrice ?? null,
                createdBy: user.userId,
                customerId: customer.id,
            });

            for (const plan of plans) {
                if (!plan) continue;

                const orderItem = await tx.orm.public.OrderItem.create({
                    orderId: order.id,
                    parfumId: plan.item.parfumId,
                    sellingType: plan.item.sellingType,
                    quantity: plan.item.quantity,
                    unitPrice: plan.unitPrice,
                    totalPrice: plan.unitPrice * plan.item.quantity,
                });

                for (const allocation of plan.allocations) {
                    if (plan.item.sellingType === 'COMPLETE') {
                        // Atomic guard: only succeeds if the batch still has enough unreserved sealed bottles.
                        const { affectedRows } = await tx.execute(
                            db.raw.sql`UPDATE "StockBatch" SET "reservedQuantity" = "reservedQuantity" + ${allocation.amount}
                                       WHERE "id" = ${allocation.id}
                                         AND "unusedQuantity" - "reservedQuantity" >= ${allocation.amount}`
                                .affectedCount().build(),
                        );
                        if (affectedRows !== 1) {
                            throw new ConflictException(`Stock batch #${allocation.id} changed while reserving. Please try again.`);
                        }

                        await tx.orm.public.StockReservation.create({
                            orderItemId: orderItem.id,
                            stockBatchId: allocation.id,
                            quantity: allocation.amount,
                            status: 'RESERVED',
                        });
                    } else {
                        const { affectedRows } = await tx.execute(
                            db.raw.sql`UPDATE "DecantBottle" SET "reservedVolumeMl" = "reservedVolumeMl" + ${allocation.amount},
                                                                 "updatedAt" = now()
                                       WHERE "id" = ${allocation.id} AND "isActive" = true
                                         AND "remainingVolumeMl" - "reservedVolumeMl" >= ${allocation.amount}`
                                .affectedCount().build(),
                        );
                        if (affectedRows !== 1) {
                            throw new ConflictException(`Decant bottle #${allocation.id} changed while reserving. Please try again.`);
                        }

                        await tx.orm.public.StockReservation.create({
                            orderItemId: orderItem.id,
                            decantBottleId: allocation.id,
                            quantityMl: allocation.amount,
                            status: 'RESERVED',
                        });
                    }
                }
            }

            return order.id;
        }));

        return this.getOrder(orderId);
    }


    // ── Confirm: deduct physical stock exactly once ─────────────────────────────────────

    // PENDING → COMFIRMED. Turns every RESERVED reservation into a real deduction:
    // sealed bottles leave unusedQuantity, millilitres leave remainingVolumeMl (one CONSUMPTION
    // DecantOpperation per bottle allocation), reservations become CONSUMED. All or nothing.
    async confirmOrder ( orderId: number, user: ActingUser ) {
        await withRetry(() => db.transaction(async (tx) => {
            // The conditional status change is the idempotency guard: a second confirmation
            // (or a confirm racing a cancel) finds no PENDING row and stops here.
            const flipped = await tx.query(
                db.raw.sql`UPDATE "Order" SET "status" = 'COMFIRMED', "verifiedAt" = now(),
                                              "verifiedBy" = ${user.userId}, "updatedAt" = now()
                           WHERE "id" = ${orderId} AND "status" = 'PENDING'
                           RETURNING "id"`
                    .returnsRow({ id: INT }).build(),
            );
            if (flipped.length !== 1) {
                await this.throwTransitionError(tx, orderId, 'confirm');
            }

            const reservations = await this.reservationsOf(tx, orderId);
            const reserved = reservations.filter((reservation) => reservation.status === 'RESERVED');

            if (reserved.length === 0 || reserved.length !== reservations.length) {
                throw new ConflictException(`This order's stock reservations are not all active anymore: it can't be confirmed.`);
            }

            for (const reservation of this.lockOrder(reserved)) {
                if (reservation.stockBatchId !== null && reservation.quantity !== null) {
                    const { affectedRows } = await tx.execute(
                        db.raw.sql`UPDATE "StockBatch"
                                   SET "unusedQuantity" = "unusedQuantity" - ${reservation.quantity},
                                       "reservedQuantity" = "reservedQuantity" - ${reservation.quantity}
                                   WHERE "id" = ${reservation.stockBatchId}
                                     AND "reservedQuantity" >= ${reservation.quantity}
                                     AND "unusedQuantity" >= ${reservation.quantity}`
                            .affectedCount().build(),
                    );
                    if (affectedRows !== 1) {
                        throw new ConflictException(`Stock batch #${reservation.stockBatchId} no longer holds this reservation.`);
                    }
                } else if (reservation.decantBottleId !== null && reservation.quantityMl !== null) {
                    const { affectedRows } = await tx.execute(
                        db.raw.sql`UPDATE "DecantBottle"
                                   SET "remainingVolumeMl" = "remainingVolumeMl" - ${reservation.quantityMl},
                                       "reservedVolumeMl" = "reservedVolumeMl" - ${reservation.quantityMl},
                                       "lastDecantedAt" = now(), "updatedAt" = now()
                                   WHERE "id" = ${reservation.decantBottleId}
                                     AND "reservedVolumeMl" >= ${reservation.quantityMl}
                                     AND "remainingVolumeMl" >= ${reservation.quantityMl}`
                            .affectedCount().build(),
                    );
                    if (affectedRows !== 1) {
                        throw new ConflictException(`Decant bottle #${reservation.decantBottleId} no longer holds this reservation.`);
                    }

                    // The audit record of the pour: one per bottle allocation.
                    await tx.orm.public.DecantOpperation.create({
                        decantBottleId: reservation.decantBottleId,
                        employeeId: user.userId,
                        quantityMl: reservation.quantityMl,
                        orderId,
                        oppType: 'CONSUMPTION',
                    });
                } else {
                    throw new ConflictException(`Reservation #${reservation.id} has no stock source.`);
                }

                await this.setReservationStatus(tx, reservation.id, 'RESERVED', 'CONSUMED');
            }
        }));

        return this.getOrder(orderId);
    }


    // ── Cancel ──────────────────────────────────────────────────────────────────────────

    // PENDING   → CANCELLED: releases the reservations (counters go down, nothing physical changes).
    // COMFIRMED → CANCELLED: OWNER only. Puts the stock back and writes one REVERSAL operation per
    //                        CONSUMPTION, so the history shows both the pour and its reversal.
    // DELIVERD / CANCELLED orders can't be cancelled.
    async cancelOrder ( orderId: number, user: ActingUser ) {
        await withRetry(() => db.transaction(async (tx) => {
            const [order] = await tx.query(
                db.raw.sql`SELECT "id", "status" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`
                    .returnsRow({ id: INT, status: TEXT }).build(),
            );
            if (!order) {
                throw new NotFoundException(`Order Not Found !`);
            }

            if (order.status === 'PENDING') {
                await this.releasePendingReservations(tx, orderId);
            } else if (order.status === 'COMFIRMED') {
                if (user.role !== 'OWNER') {
                    throw new ForbiddenException(`Only an owner can cancel a confirmed order: its stock has already been used.`);
                }
                await this.reverseConfirmedOrder(tx, orderId, user);
            } else {
                await this.throwTransitionError(tx, orderId, 'cancel');
            }

            const flipped = await tx.query(
                db.raw.sql`UPDATE "Order" SET "status" = 'CANCELLED', "cancelledAt" = now(),
                                              "cancelledBy" = ${user.userId}, "updatedAt" = now()
                           WHERE "id" = ${orderId} AND "status" = ${order.status}
                           RETURNING "id"`
                    .returnsRow({ id: INT }).build(),
            );
            if (flipped.length !== 1) {
                throw new ConflictException(`This order changed while it was being cancelled. Please reload it.`);
            }
        }));

        return this.getOrder(orderId);
    }

    private async releasePendingReservations ( tx: Tx, orderId: number ) {
        const reservations = await this.reservationsOf(tx, orderId);

        for (const reservation of this.lockOrder(reservations.filter((r) => r.status === 'RESERVED'))) {
            if (reservation.stockBatchId !== null && reservation.quantity !== null) {
                const { affectedRows } = await tx.execute(
                    db.raw.sql`UPDATE "StockBatch" SET "reservedQuantity" = "reservedQuantity" - ${reservation.quantity}
                               WHERE "id" = ${reservation.stockBatchId} AND "reservedQuantity" >= ${reservation.quantity}`
                        .affectedCount().build(),
                );
                if (affectedRows !== 1) {
                    throw new ConflictException(`Stock batch #${reservation.stockBatchId} no longer holds this reservation.`);
                }
            } else if (reservation.decantBottleId !== null && reservation.quantityMl !== null) {
                const { affectedRows } = await tx.execute(
                    db.raw.sql`UPDATE "DecantBottle" SET "reservedVolumeMl" = "reservedVolumeMl" - ${reservation.quantityMl},
                                                         "updatedAt" = now()
                               WHERE "id" = ${reservation.decantBottleId} AND "reservedVolumeMl" >= ${reservation.quantityMl}`
                        .affectedCount().build(),
                );
                if (affectedRows !== 1) {
                    throw new ConflictException(`Decant bottle #${reservation.decantBottleId} no longer holds this reservation.`);
                }
            }

            await this.setReservationStatus(tx, reservation.id, 'RESERVED', 'RELEASED');
        }
    }

    private async reverseConfirmedOrder ( tx: Tx, orderId: number, user: ActingUser ) {
        const reservations = await this.reservationsOf(tx, orderId);

        for (const reservation of this.lockOrder(reservations.filter((r) => r.status === 'CONSUMED'))) {
            if (reservation.stockBatchId !== null && reservation.quantity !== null) {
                // The sealed bottles come back to the batch (never above what was received).
                const { affectedRows } = await tx.execute(
                    db.raw.sql`UPDATE "StockBatch" SET "unusedQuantity" = "unusedQuantity" + ${reservation.quantity}
                               WHERE "id" = ${reservation.stockBatchId}
                                 AND "unusedQuantity" + ${reservation.quantity} <= "quantity"`
                        .affectedCount().build(),
                );
                if (affectedRows !== 1) {
                    throw new ConflictException(`Stock batch #${reservation.stockBatchId} can't take these bottles back.`);
                }
            } else if (reservation.decantBottleId !== null && reservation.quantityMl !== null) {
                const { affectedRows } = await tx.execute(
                    db.raw.sql`UPDATE "DecantBottle" SET "remainingVolumeMl" = "remainingVolumeMl" + ${reservation.quantityMl},
                                                         "updatedAt" = now()
                               WHERE "id" = ${reservation.decantBottleId}
                                 AND "remainingVolumeMl" + ${reservation.quantityMl} <= "initialVolumeMl"`
                        .affectedCount().build(),
                );
                if (affectedRows !== 1) {
                    throw new ConflictException(`Decant bottle #${reservation.decantBottleId} can't take this volume back.`);
                }
            }

            await this.setReservationStatus(tx, reservation.id, 'CONSUMED', 'RELEASED');
        }

        // One REVERSAL per CONSUMPTION. reversedOperationId is UNIQUE in the database,
        // so a consumption can never be reversed twice.
        const consumptions = await tx.orm.public.DecantOpperation
            .where((op) => and(op.orderId.eq(orderId), op.oppType.eq('CONSUMPTION')))
            .orderBy((op) => op.id.asc())
            .all();

        for (const consumption of consumptions) {
            await tx.orm.public.DecantOpperation.create({
                decantBottleId: consumption.decantBottleId,
                employeeId: user.userId,
                quantityMl: consumption.quantityMl,
                orderId,
                oppType: 'REVERSAL',
                reversedOperationId: consumption.id,
            });
        }
    }


    // ── Deliver ─────────────────────────────────────────────────────────────────────────

    // COMFIRMED → DELIVERD. Only the status and date change: stock was already deducted on confirmation.
    async deliverOrder ( orderId: number ) {
        await db.transaction(async (tx) => {
            const flipped = await tx.query(
                db.raw.sql`UPDATE "Order" SET "status" = 'DELIVERD', "delivredAt" = now(), "updatedAt" = now()
                           WHERE "id" = ${orderId} AND "status" = 'COMFIRMED'
                           RETURNING "id"`
                    .returnsRow({ id: INT }).build(),
            );
            if (flipped.length !== 1) {
                await this.throwTransitionError(tx, orderId, 'deliver');
            }
        });

        return this.getOrder(orderId);
    }


    // ── Reads ───────────────────────────────────────────────────────────────────────────

    async listOrders ( query: OrderListQueryDto ) {
        let orders = db.orm.public.Order
            .include('customer', (customer) => customer.select('id', 'fullName', 'phoneNumber'))
            .include('userCreator', (creator) => creator.select(...userSummary))
            .include('orderItems', (items) => items.select('id', 'sellingType', 'quantity', 'totalPrice'))
            .orderBy((order) => order.id.desc());

        if (query.status) {
            const status = query.status;
            orders = orders.where((order) => order.status.eq(status));
        }
        if (query.from) {
            const from = Temporal.Instant.from(startOfDay(query.from));
            orders = orders.where((order) => order.pendingAt.gte(from));
        }
        if (query.to) {
            const to = Temporal.Instant.from(endOfDay(query.to));
            orders = orders.where((order) => order.pendingAt.lte(to));
        }

        const rows = await orders.all();
        const search = query.search?.trim().toLowerCase();

        return rows
            .filter((order) => {
                if (!search) return true;
                const id = search.replace(/^#/, '');
                return String(order.id) === id
                    || order.customer?.fullName.toLowerCase().includes(search)
                    || order.customer?.phoneNumber.includes(search);
            })
            .map((order) => {
                const itemsTotal = order.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
                return {
                    ...order,
                    itemCount: order.orderItems.length,
                    itemsTotal,
                    total: itemsTotal + (order.deliveryPrice ?? 0),
                };
            });
    }

    async getOrder ( orderId: number ) {
        const order = await db.orm.public.Order
            .where({ id: orderId })
            .include('customer', (customer) => customer.select('id', 'fullName', 'email', 'phoneNumber', 'address', 'isActive'))
            .include('userCreator', (creator) => creator.select(...userSummary))
            .include('userVerifier', (verifier) => verifier.select(...userSummary))
            .include('userCanceller', (canceller) => canceller.select(...userSummary))
            .include('orderItems', (items) => items
                .orderBy((item) => item.id.asc())
                .include('parfum', (parfum) => parfum
                    .select('id', 'name', 'originalVolume')
                    .include('brand', (brand) => brand.select('name', 'image')))
                .include('stockReservations', (reservations) => reservations
                    .orderBy((reservation) => reservation.id.asc())
                    .include('stockBatch', (batch) => batch.select('id', 'receivedAt', 'quantity'))
                    .include('decantBottle', (bottle) => bottle.select('id', 'initialVolumeMl', 'createdAt'))))
            .include('decantOpperations', (operations) => operations
                .orderBy((op) => op.id.asc())
                .include('employee', (employee) => employee.select(...userSummary)))
            .first();

        if (!order) {
            throw new NotFoundException(`Order Not Found !`);
        }

        const itemsTotal = order.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return {
            ...order,
            itemsTotal,
            total: itemsTotal + (order.deliveryPrice ?? 0),
        };
    }

    // What can be sold right now, per active perfume (used by the order form).
    // Informative only: the reservation transaction re-checks everything.
    async availability ( ) {
        const parfums = await db.orm.public.Parfum
            .where((parfum) => parfum.isActive.eq(true))
            .include('brand', (brand) => brand.select('name', 'image'))
            .include('stockBatch', (batches) => batches.select('unusedQuantity', 'reservedQuantity'))
            .include('decantBottles', (bottles) => bottles
                .where((bottle) => bottle.isActive.eq(true))
                .select('remainingVolumeMl', 'reservedVolumeMl'))
            .orderBy((parfum) => parfum.name.asc())
            .all();

        return parfums.map(({ stockBatch, decantBottles, ...parfum }) => ({
            ...parfum,
            availableBottles: stockBatch.reduce((sum, batch) => sum + Math.max(batch.unusedQuantity - batch.reservedQuantity, 0), 0),
            availableMl: decantBottles.reduce((sum, bottle) => sum + Math.max(bottle.remainingVolumeMl - bottle.reservedVolumeMl, 0), 0),
            openBottles: decantBottles.length,
        }));
    }


    // ── Helpers ─────────────────────────────────────────────────────────────────────────

    private async reservationsOf ( tx: Tx, orderId: number ) {
        const items = await tx.orm.public.OrderItem.where({ orderId }).select('id').all();
        if (items.length === 0) return [];

        const itemIds = items.map((item) => item.id);
        return tx.orm.public.StockReservation
            .where((reservation) => reservation.orderItemId.in(itemIds))
            .orderBy((reservation) => reservation.id.asc())
            .all();
    }

    // Touch batches before bottles, each in id order: every transaction locks rows in the same order.
    private lockOrder<R extends { id: number; stockBatchId: number | null; decantBottleId: number | null }> ( reservations: R[] ) {
        return [...reservations].sort((a, b) => {
            const aKey = a.stockBatchId !== null ? [0, a.stockBatchId] : [1, a.decantBottleId ?? 0];
            const bKey = b.stockBatchId !== null ? [0, b.stockBatchId] : [1, b.decantBottleId ?? 0];
            return aKey[0] - bKey[0] || aKey[1] - bKey[1] || a.id - b.id;
        });
    }

    private async setReservationStatus (
        tx: Tx,
        reservationId: number,
        from: 'RESERVED' | 'CONSUMED',
        to: 'CONSUMED' | 'RELEASED',
    ) {
        const plan = to === 'CONSUMED'
            ? db.raw.sql`UPDATE "StockReservation" SET "status" = 'CONSUMED', "consumedAt" = now(), "updatedAt" = now()
                         WHERE "id" = ${reservationId} AND "status" = ${from}`
            : db.raw.sql`UPDATE "StockReservation" SET "status" = 'RELEASED', "releasedAt" = now(), "updatedAt" = now()
                         WHERE "id" = ${reservationId} AND "status" = ${from}`;

        const { affectedRows } = await tx.execute(plan.affectedCount().build());
        if (affectedRows !== 1) {
            throw new ConflictException(`Reservation #${reservationId} is no longer ${from}.`);
        }
    }

    // Explains why a status change was refused: 404, or 409 with the current status.
    private async throwTransitionError ( tx: Tx, orderId: number, action: 'confirm' | 'cancel' | 'deliver' ): Promise<never> {
        const order = await tx.orm.public.Order.where({ id: orderId }).select('id', 'status').first();
        if (!order) {
            throw new NotFoundException(`Order Not Found !`);
        }

        const allowedFrom = { confirm: 'PENDING', cancel: 'PENDING or COMFIRMED', deliver: 'COMFIRMED' }[action];
        throw new ConflictException(`Order #${orderId} is ${order.status}: only a ${allowedFrom} order can be ${action === 'confirm' ? 'confirmed' : action === 'cancel' ? 'cancelled' : 'delivered'}.`);
    }

}


function startOfDay ( iso: string ) {
    return iso.length <= 10 ? `${iso}T00:00:00Z` : toInstantString(iso);
}

function endOfDay ( iso: string ) {
    return iso.length <= 10 ? `${iso}T23:59:59.999Z` : toInstantString(iso);
}

function toInstantString ( iso: string ) {
    return new Date(iso).toISOString();
}
