// Integration tests of the order reservation workflow against the REAL database (DATABASE_URL).
// They only touch their own fixture rows (brand "ZZTEST Reservations", customer "ZZTEST Customer")
// and delete them afterwards. Run with: npm run test:e2e -- order-reservation
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { db } from '../src/prisma/db.js';
import { OrderService, type ActingUser } from '../src/order/order.service.js';

const INT = 'pg/int4@1';
const service = new OrderService();

let owner: ActingUser;
let employee: ActingUser;
let customerId: number;
let parfumId: number;
let batchA: number; // older batch
let batchB: number; // newer batch
let bottle1: number; // older open bottle, 25 ml left
let bottle2: number; // newer open bottle, 100 ml left

async function batchRow ( id: number ) {
  const [row] = await db.runtime().query(
    db.raw.sql`SELECT "unusedQuantity", "reservedQuantity" FROM "StockBatch" WHERE "id" = ${id}`
      .returnsRow({ unusedQuantity: INT, reservedQuantity: INT }).build(),
  );
  return row;
}

async function bottleRow ( id: number ) {
  const [row] = await db.runtime().query(
    db.raw.sql`SELECT "remainingVolumeMl", "reservedVolumeMl" FROM "DecantBottle" WHERE "id" = ${id}`
      .returnsRow({ remainingVolumeMl: INT, reservedVolumeMl: INT }).build(),
  );
  return row;
}

async function fixtureOrderCount () {
  const [row] = await db.runtime().query(
    db.raw.sql`SELECT count(*)::int4 AS "n" FROM "Order" WHERE "customerId" = ${customerId}`
      .returnsRow({ n: INT }).build(),
  );
  return row.n;
}

// Removes every order of the fixture customer (with items, reservations, operations).
async function deleteFixtureOrders () {
  if (!customerId) return;
  const run = (plan: ReturnType<ReturnType<typeof db.raw.sql>['affectedCount']>) => db.runtime().execute(plan.build());
  await run(db.raw.sql`DELETE FROM "DecantOpperation" WHERE "reversedOperationId" IS NOT NULL AND "orderId" IN (SELECT "id" FROM "Order" WHERE "customerId" = ${customerId})`.affectedCount());
  await run(db.raw.sql`DELETE FROM "DecantOpperation" WHERE "orderId" IN (SELECT "id" FROM "Order" WHERE "customerId" = ${customerId})`.affectedCount());
  await run(db.raw.sql`DELETE FROM "StockReservation" WHERE "orderItemId" IN (SELECT oi."id" FROM "OrderItem" oi JOIN "Order" o ON o."id" = oi."orderId" WHERE o."customerId" = ${customerId})`.affectedCount());
  await run(db.raw.sql`DELETE FROM "OrderItem" WHERE "orderId" IN (SELECT "id" FROM "Order" WHERE "customerId" = ${customerId})`.affectedCount());
  await run(db.raw.sql`DELETE FROM "Order" WHERE "customerId" = ${customerId}`.affectedCount());
}

// Puts the fixture stock back to its starting point before every test.
async function resetStock () {
  await deleteFixtureOrders();
  await db.runtime().execute(db.raw.sql`UPDATE "StockBatch" SET "unusedQuantity" = 3, "reservedQuantity" = 0 WHERE "id" = ${batchA}`.affectedCount().build());
  await db.runtime().execute(db.raw.sql`UPDATE "StockBatch" SET "unusedQuantity" = 2, "reservedQuantity" = 0 WHERE "id" = ${batchB}`.affectedCount().build());
  await db.runtime().execute(db.raw.sql`UPDATE "DecantBottle" SET "remainingVolumeMl" = 25, "reservedVolumeMl" = 0 WHERE "id" = ${bottle1}`.affectedCount().build());
  await db.runtime().execute(db.raw.sql`UPDATE "DecantBottle" SET "remainingVolumeMl" = 100, "reservedVolumeMl" = 0 WHERE "id" = ${bottle2}`.affectedCount().build());
}

async function expectRejects ( promise: Promise<unknown>, type: new (...args: never[]) => Error ) {
  await expect(promise).rejects.toBeInstanceOf(type);
}

beforeAll(async () => {
  const ownerRow = await db.orm.public.User.where({ Role: 'OWNER' }).first();
  const employeeRow = await db.orm.public.User.where({ Role: 'EMPLOYEE' }).first();
  if (!ownerRow || !employeeRow) throw new Error('The database needs at least one OWNER and one EMPLOYEE user.');
  owner = { userId: ownerRow.id, username: ownerRow.username, role: 'OWNER' };
  employee = { userId: employeeRow.id, username: employeeRow.username, role: 'EMPLOYEE' };

  const brand = await db.orm.public.Brand.create({ name: `ZZTEST Reservations ${Date.now()}` });
  const parfum = await db.orm.public.Parfum.create({
    name: 'ZZTEST Parfum', brandId: brand.id, originalVolume: 100,
    completePrice: 1000, decant10Price: 150, decant20Price: 280,
  });
  parfumId = parfum.id;

  batchA = (await db.orm.public.StockBatch.create({ parfumId, quantity: 5, unusedQuantity: 3, purchaseCostPerBottle: 600, receivedBy: owner.userId })).id;
  batchB = (await db.orm.public.StockBatch.create({ parfumId, quantity: 2, unusedQuantity: 2, purchaseCostPerBottle: 650, receivedBy: owner.userId })).id;
  bottle1 = (await db.orm.public.DecantBottle.create({ parfumId, stockBatchId: batchA, initialVolumeMl: 100, remainingVolumeMl: 25 })).id;
  bottle2 = (await db.orm.public.DecantBottle.create({ parfumId, stockBatchId: batchA, initialVolumeMl: 100, remainingVolumeMl: 100 })).id;

  customerId = (await db.orm.public.Customer.create({
    fullName: 'ZZTEST Customer', email: `zztest.${Date.now()}@example.com`, phoneNumber: `+2120${Date.now()}`, address: 'Test street',
  })).id;
});

beforeEach(async () => {
  await resetStock();
});

afterAll(async () => {
  await deleteFixtureOrders();
  await db.runtime().execute(db.raw.sql`DELETE FROM "DecantBottle" WHERE "parfumId" = ${parfumId}`.affectedCount().build());
  await db.runtime().execute(db.raw.sql`DELETE FROM "StockBatch" WHERE "parfumId" = ${parfumId}`.affectedCount().build());
  const parfum = await db.orm.public.Parfum.where({ id: parfumId }).first();
  await db.runtime().execute(db.raw.sql`DELETE FROM "Parfum" WHERE "id" = ${parfumId}`.affectedCount().build());
  if (parfum) await db.runtime().execute(db.raw.sql`DELETE FROM "Brand" WHERE "id" = ${parfum.brandId}`.affectedCount().build());
  await db.runtime().execute(db.raw.sql`DELETE FROM "Customer" WHERE "id" = ${customerId}`.affectedCount().build());
});


describe('creating an order reserves stock', () => {
  it('1. reserves complete bottles from the oldest batch without touching physical stock', async () => {
    const order = await service.createOrder({ customerId, items: [{ parfumId, sellingType: 'COMPLETE', quantity: 2 }] }, employee);

    expect(order.status).toBe('PENDING');
    expect(order.total).toBe(2000);
    const reservations = order.orderItems[0].stockReservations;
    expect(reservations).toHaveLength(1);
    expect(reservations[0]).toMatchObject({ stockBatchId: batchA, quantity: 2, status: 'RESERVED', decantBottleId: null });
    expect(await batchRow(batchA)).toEqual({ unusedQuantity: 3, reservedQuantity: 2 });
  });

  it('2. reserves decant millilitres', async () => {
    const order = await service.createOrder({ customerId, items: [{ parfumId, sellingType: 'DECANT_10ML', quantity: 1 }] }, owner);

    expect(order.orderItems[0].stockReservations[0]).toMatchObject({ decantBottleId: bottle1, quantityMl: 10, status: 'RESERVED' });
    expect(await bottleRow(bottle1)).toEqual({ remainingVolumeMl: 25, reservedVolumeMl: 10 });
  });

  it('3. spreads one decant line over several open bottles', async () => {
    const order = await service.createOrder({ customerId, items: [{ parfumId, sellingType: 'DECANT_20ML', quantity: 2 }] }, owner);

    const reservations = order.orderItems[0].stockReservations;
    expect(reservations.map((r) => [r.decantBottleId, r.quantityMl])).toEqual([[bottle1, 25], [bottle2, 15]]);
    expect(await bottleRow(bottle1)).toEqual({ remainingVolumeMl: 25, reservedVolumeMl: 25 });
    expect(await bottleRow(bottle2)).toEqual({ remainingVolumeMl: 100, reservedVolumeMl: 15 });
  });

  it('4. rejects an order when stock is insufficient', async () => {
    await expectRejects(
      service.createOrder({ customerId, items: [{ parfumId, sellingType: 'COMPLETE', quantity: 6 }] }, owner),
      ConflictException,
    );
    expect(await fixtureOrderCount()).toBe(0);
  });

  it('5. leaves no partial reservation when one line of a multi-line order fails', async () => {
    await expectRejects(
      service.createOrder({
        customerId,
        items: [
          { parfumId, sellingType: 'COMPLETE', quantity: 1 },
          { parfumId, sellingType: 'DECANT_20ML', quantity: 7 }, // 140 ml > 125 ml available
        ],
      }, owner),
      ConflictException,
    );

    expect(await fixtureOrderCount()).toBe(0);
    expect(await batchRow(batchA)).toEqual({ unusedQuantity: 3, reservedQuantity: 0 });
    expect(await bottleRow(bottle1)).toEqual({ remainingVolumeMl: 25, reservedVolumeMl: 0 });
    expect(await bottleRow(bottle2)).toEqual({ remainingVolumeMl: 100, reservedVolumeMl: 0 });
  });

  it('6. never lets two concurrent orders reserve the same stock', async () => {
    // 5 sealed bottles available in total: each order wants 4, so only one can succeed.
    const attempts = await Promise.allSettled([
      service.createOrder({ customerId, items: [{ parfumId, sellingType: 'COMPLETE', quantity: 4 }] }, owner),
      service.createOrder({ customerId, items: [{ parfumId, sellingType: 'COMPLETE', quantity: 4 }] }, employee),
    ]);

    expect(attempts.filter((a) => a.status === 'fulfilled')).toHaveLength(1);
    const failure = attempts.find((a) => a.status === 'rejected') as PromiseRejectedResult;
    expect(failure.reason).toBeInstanceOf(ConflictException);

    const a = await batchRow(batchA);
    const b = await batchRow(batchB);
    expect(a.reservedQuantity + b.reservedQuantity).toBe(4);
    expect(a.reservedQuantity).toBeLessThanOrEqual(a.unusedQuantity);
    expect(b.reservedQuantity).toBeLessThanOrEqual(b.unusedQuantity);
    expect(await fixtureOrderCount()).toBe(1);
  });
});


describe('confirming, delivering and cancelling', () => {
  it('7. confirm deducts physical stock exactly once', async () => {
    const order = await service.createOrder({ customerId, items: [{ parfumId, sellingType: 'COMPLETE', quantity: 2 }] }, employee);

    const confirmed = await service.confirmOrder(order.id, employee);
    expect(confirmed.status).toBe('COMFIRMED');
    expect(confirmed.verifiedBy).toBe(employee.userId);
    expect(confirmed.orderItems[0].stockReservations[0].status).toBe('CONSUMED');
    expect(await batchRow(batchA)).toEqual({ unusedQuantity: 1, reservedQuantity: 0 });

    // 10. A second confirmation is refused and deducts nothing.
    await expectRejects(service.confirmOrder(order.id, owner), ConflictException);
    expect(await batchRow(batchA)).toEqual({ unusedQuantity: 1, reservedQuantity: 0 });
  });

  it('8. creates one CONSUMPTION operation per decant allocation', async () => {
    const order = await service.createOrder({ customerId, items: [{ parfumId, sellingType: 'DECANT_20ML', quantity: 2 }] }, owner);
    const confirmed = await service.confirmOrder(order.id, employee);

    const operations = confirmed.decantOpperations;
    expect(operations.map((op) => [op.decantBottleId, op.quantityMl, op.oppType, op.employeeId])).toEqual([
      [bottle1, 25, 'CONSUMPTION', employee.userId],
      [bottle2, 15, 'CONSUMPTION', employee.userId],
    ]);
    expect(await bottleRow(bottle1)).toEqual({ remainingVolumeMl: 0, reservedVolumeMl: 0 });
    expect(await bottleRow(bottle2)).toEqual({ remainingVolumeMl: 85, reservedVolumeMl: 0 });
  });

  it('9. cancelling a pending order releases its reservations', async () => {
    const order = await service.createOrder({
      customerId,
      items: [
        { parfumId, sellingType: 'COMPLETE', quantity: 1 },
        { parfumId, sellingType: 'DECANT_10ML', quantity: 3 },
      ],
    }, employee);

    const cancelled = await service.cancelOrder(order.id, employee);
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledBy).toBe(employee.userId);
    for (const item of cancelled.orderItems) {
      for (const reservation of item.stockReservations) expect(reservation.status).toBe('RELEASED');
    }
    expect(cancelled.decantOpperations).toHaveLength(0);
    expect(await batchRow(batchA)).toEqual({ unusedQuantity: 3, reservedQuantity: 0 });
    expect(await bottleRow(bottle1)).toEqual({ remainingVolumeMl: 25, reservedVolumeMl: 0 });
    expect(await bottleRow(bottle2)).toEqual({ remainingVolumeMl: 100, reservedVolumeMl: 0 });

    // 10. Cancelling twice is refused; confirming a cancelled order too.
    await expectRejects(service.cancelOrder(order.id, owner), ConflictException);
    await expectRejects(service.confirmOrder(order.id, owner), ConflictException);
  });

  it('11. delivering does not deduct stock a second time', async () => {
    const order = await service.createOrder({ customerId, items: [{ parfumId, sellingType: 'DECANT_10ML', quantity: 2 }] }, owner);
    await service.confirmOrder(order.id, owner);
    const afterConfirm = await bottleRow(bottle1);

    const delivered = await service.deliverOrder(order.id);
    expect(delivered.status).toBe('DELIVERD');
    expect(delivered.delivredAt).not.toBeNull();
    expect(await bottleRow(bottle1)).toEqual(afterConfirm);
    expect(delivered.decantOpperations).toHaveLength(1);

    await expectRejects(service.deliverOrder(order.id), ConflictException);
    await expectRejects(service.cancelOrder(order.id, owner), ConflictException);
  });

  it('12. cancelling a confirmed order is owner-only and reverses each consumption once', async () => {
    const order = await service.createOrder({
      customerId,
      items: [
        { parfumId, sellingType: 'COMPLETE', quantity: 1 },
        { parfumId, sellingType: 'DECANT_20ML', quantity: 2 },
      ],
    }, employee);
    await service.confirmOrder(order.id, employee);

    // 13. An employee can't undo used stock.
    await expectRejects(service.cancelOrder(order.id, employee), ForbiddenException);

    const cancelled = await service.cancelOrder(order.id, owner);
    expect(cancelled.status).toBe('CANCELLED');
    const reversals = cancelled.decantOpperations.filter((op) => op.oppType === 'REVERSAL');
    const consumptions = cancelled.decantOpperations.filter((op) => op.oppType === 'CONSUMPTION');
    expect(reversals).toHaveLength(consumptions.length);
    expect(reversals.map((op) => op.reversedOperationId).sort()).toEqual(consumptions.map((op) => op.id).sort());

    expect(await batchRow(batchA)).toEqual({ unusedQuantity: 3, reservedQuantity: 0 });
    expect(await bottleRow(bottle1)).toEqual({ remainingVolumeMl: 25, reservedVolumeMl: 0 });
    expect(await bottleRow(bottle2)).toEqual({ remainingVolumeMl: 100, reservedVolumeMl: 0 });

    // No second reversal.
    await expectRejects(service.cancelOrder(order.id, owner), ConflictException);
    const again = await service.getOrder(order.id);
    expect(again.decantOpperations.filter((op) => op.oppType === 'REVERSAL')).toHaveLength(reversals.length);
  });

  it('returns 404 for unknown orders', async () => {
    await expectRejects(service.confirmOrder(999999, owner), NotFoundException);
    await expectRejects(service.cancelOrder(999999, owner), NotFoundException);
    await expectRejects(service.getOrder(999999), NotFoundException);
  });
});
