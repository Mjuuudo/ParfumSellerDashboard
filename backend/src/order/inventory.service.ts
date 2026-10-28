import { Injectable } from "@nestjs/common";
import { db } from "../prisma/db.js";
import { DecantOperationQueryDto } from "./dto/listOrders.dto.js";


const userSummary = ['id', 'username', 'firstName', 'lastName'] as const;

// Read-only views of stock levels, reservations and decant operations.
@Injectable()
export class InventoryService {


    // Every batch (sealed bottles) and every opened bottle (millilitres), with their
    // physical / reserved / available amounts and the reservations currently holding stock.
    async overview ( ) {
        const [batches, bottles] = await Promise.all([
            db.orm.public.StockBatch
                .include('parfum', (parfum) => parfum
                    .select('id', 'name', 'originalVolume')
                    .include('brand', (brand) => brand.select('name', 'image')))
                .include('stockReservations', (reservations) => reservations
                    .where((reservation) => reservation.status.eq('RESERVED'))
                    .orderBy((reservation) => reservation.id.asc())
                    .include('orderItem', (item) => item.select('id', 'orderId', 'sellingType')))
                .orderBy((batch) => batch.id.asc())
                .all(),
            db.orm.public.DecantBottle
                .include('parfum', (parfum) => parfum
                    .select('id', 'name', 'originalVolume')
                    .include('brand', (brand) => brand.select('name', 'image')))
                .include('stockReservations', (reservations) => reservations
                    .where((reservation) => reservation.status.eq('RESERVED'))
                    .orderBy((reservation) => reservation.id.asc())
                    .include('orderItem', (item) => item.select('id', 'orderId', 'sellingType')))
                .include('decantOpperation', (operations) => operations
                    .orderBy((op) => op.id.desc())
                    .limit(10)
                    .include('employee', (employee) => employee.select(...userSummary)))
                .orderBy((bottle) => bottle.id.asc())
                .all(),
        ]);

        return {
            batches: batches.map(({ stockReservations, ...batch }) => ({
                ...batch,
                availableQuantity: Math.max(batch.unusedQuantity - batch.reservedQuantity, 0),
                reservations: stockReservations,
            })),
            bottles: bottles.map(({ stockReservations, decantOpperation, ...bottle }) => ({
                ...bottle,
                availableVolumeMl: Math.max(bottle.remainingVolumeMl - bottle.reservedVolumeMl, 0),
                reservations: stockReservations,
                recentOperations: decantOpperation,
            })),
        };
    }


    // Decant operation history, newest first, with optional filters.
    async decantOperations ( query: DecantOperationQueryDto ) {
        let operations = db.orm.public.DecantOpperation
            .include('employee', (employee) => employee.select(...userSummary))
            .include('decantBottle', (bottle) => bottle
                .select('id', 'parfumId', 'initialVolumeMl', 'remainingVolumeMl')
                .include('parfum', (parfum) => parfum
                    .select('id', 'name', 'originalVolume')
                    .include('brand', (brand) => brand.select('name', 'image'))))
            .include('reversedOpperation', (op) => op.select('id', 'performedAt'))
            .include('reversedByOpperation', (op) => op.select('id', 'performedAt'))
            .orderBy([(op) => op.performedAt.desc(), (op) => op.id.desc()]);

        if (query.type) {
            const type = query.type;
            operations = operations.where((op) => op.oppType.eq(type));
        }
        if (query.bottleId) {
            const bottleId = query.bottleId;
            operations = operations.where((op) => op.decantBottleId.eq(bottleId));
        }
        if (query.orderId) {
            const orderId = query.orderId;
            operations = operations.where((op) => op.orderId.eq(orderId));
        }
        const rows = await operations.all();
        return query.parfumId
            ? rows.filter((op) => op.decantBottle?.parfumId === query.parfumId)
            : rows;
    }


    // Reservations still holding stock (RESERVED), for one order or for everything.
    async activeReservations ( ) {
        return db.orm.public.StockReservation
            .where((reservation) => reservation.status.eq('RESERVED'))
            .include('orderItem', (item) => item.select('id', 'orderId', 'sellingType', 'quantity'))
            .orderBy((reservation) => reservation.id.desc())
            .all();
    }

}
