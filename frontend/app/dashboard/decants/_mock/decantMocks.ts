// ⚠ PROTOTYPE MOCK DATA, delete this file once the decant endpoints exist.
// Nothing here comes from (or is saved to) the database. Ids start at 100+ so
// they can't be confused with your real perfumes and batches.
//
// Each bottle's remainingVolumeMl and lastDecantedAt are CALCULATED from its mock
// operations below, so the numbers on screen always add up.

import type { Parfum } from "../../parfums/_components/parfum";
import type { StockBatch } from "../../stock/_components/stockBatch";
import type { DecantBottle, DecantOperation } from "../_components/decantBottle";

const users = [
  { id: 1, firstName: "Abdelmajid", lastName: "Ait", username: "abait-ou" },
  { id: 2, firstName: "Yassine", lastName: "Amrani", username: "abiat-ou" },
  { id: 3, firstName: "Sara", lastName: "Benali", username: "sara.b" },
];

export const mockParfums: Parfum[] = [
  { id: 101, name: "Sauvage Eau de Parfum", brandId: 1, originalVolume: 100, completePrice: 1650, decant10Price: 220, decant20Price: 400, isActive: true, brand: { id: 1, name: "DIOR", image: null } },
  { id: 102, name: "Bleu de Chanel EDP", brandId: 3, originalVolume: 100, completePrice: 1800, decant10Price: 240, decant20Price: 440, isActive: true, brand: { id: 3, name: "CHANEL", image: null } },
  { id: 103, name: "9 PM", brandId: 5, originalVolume: 100, completePrice: 420, decant10Price: 70, decant20Price: 120, isActive: true, brand: { id: 5, name: "AFNAN", image: null } },
  { id: 104, name: "Imagination", brandId: 2, originalVolume: 100, completePrice: 3400, decant10Price: 450, decant20Price: 850, isActive: true, brand: { id: 2, name: "LOUIS VUITTON", image: null } },
  { id: 105, name: "CK One", brandId: 7, originalVolume: 200, completePrice: 650, decant10Price: 60, decant20Price: 100, isActive: true, brand: { id: 7, name: "CALVIN KLEIN", image: null } },
  { id: 106, name: "Coco Mademoiselle", brandId: 3, originalVolume: 50, completePrice: 1900, decant10Price: 420, decant20Price: 800, isActive: true, brand: { id: 3, name: "CHANEL", image: null } },
];

export const mockBatches: StockBatch[] = [
  { id: 201, parfumId: 101, quantity: 6, purchaseCostPerBottle: 1100, receivedAt: "2026-08-14T09:30:00.000Z", receivedBy: 2 },
  { id: 202, parfumId: 101, quantity: 4, purchaseCostPerBottle: 1150, receivedAt: "2026-10-02T11:00:00.000Z", receivedBy: 1 },
  { id: 203, parfumId: 102, quantity: 3, purchaseCostPerBottle: 1300, receivedAt: "2026-09-05T10:15:00.000Z", receivedBy: 2 },
  { id: 204, parfumId: 103, quantity: 10, purchaseCostPerBottle: 280, receivedAt: "2026-07-20T14:45:00.000Z", receivedBy: 3 },
  // Only 1 bottle, already opened → shows the "no unopened bottles" validation.
  { id: 205, parfumId: 104, quantity: 1, purchaseCostPerBottle: 2600, receivedAt: "2026-09-28T16:20:00.000Z", receivedBy: 2 },
  { id: 206, parfumId: 105, quantity: 5, purchaseCostPerBottle: 450, receivedAt: "2026-06-11T08:50:00.000Z", receivedBy: 1 },
  // Coco Mademoiselle: delivered but never opened.
  { id: 207, parfumId: 106, quantity: 2, purchaseCostPerBottle: 1400, receivedAt: "2026-10-15T12:00:00.000Z", receivedBy: 2 },
];

// Bottles WITHOUT remaining volume: that's calculated from the operations below.
const rawBottles = [
  { id: 1, parfumId: 101, stockBatchId: 201, reservedById: 3, reservedAt: "2026-10-20T09:00:00.000Z", isActive: true, createdAt: "2026-08-20T10:00:00.000Z" },
  { id: 2, parfumId: 101, stockBatchId: 201, reservedById: null, reservedAt: null, isActive: true, createdAt: "2026-08-16T09:00:00.000Z" },
  { id: 3, parfumId: 102, stockBatchId: 203, reservedById: null, reservedAt: null, isActive: true, createdAt: "2026-09-10T15:30:00.000Z" },
  { id: 4, parfumId: 103, stockBatchId: 204, reservedById: null, reservedAt: null, isActive: true, createdAt: "2026-10-25T11:10:00.000Z" },
  { id: 5, parfumId: 103, stockBatchId: 204, reservedById: 1, reservedAt: "2026-09-01T08:00:00.000Z", isActive: true, createdAt: "2026-07-25T13:00:00.000Z" },
  { id: 6, parfumId: 104, stockBatchId: 205, reservedById: 1, reservedAt: "2026-10-01T10:00:00.000Z", isActive: true, createdAt: "2026-09-30T17:00:00.000Z" },
  { id: 7, parfumId: 105, stockBatchId: 206, reservedById: null, reservedAt: null, isActive: true, createdAt: "2026-08-05T09:45:00.000Z" },
  { id: 8, parfumId: 105, stockBatchId: 206, reservedById: null, reservedAt: null, isActive: false, createdAt: "2026-06-12T10:00:00.000Z" },
];

// Helper to keep the operations list short: [bottleId, ml, orderId, employeeId, date, reversesId?]
type RawOp = [number, number, number, number, string, number?];
const rawOps: RawOp[] = [
  // Bottle 1, Sauvage: several sales, one order cancelled (reversal)
  [1, 20, 1001, 3, "2026-08-22T12:10:00.000Z"],
  [1, 10, 1004, 3, "2026-08-30T16:40:00.000Z"],
  [1, 10, 1015, 1, "2026-09-20T11:05:00.000Z"],
  [1, 10, 1015, 1, "2026-09-21T09:30:00.000Z", 3], // reverses op #3 (order 1015 cancelled)
  [1, 20, 1022, 3, "2026-10-05T14:20:00.000Z"],
  [1, 10, 1030, 3, "2026-10-21T18:00:00.000Z"],
  // Bottle 2, Sauvage: fully used
  [2, 20, 1002, 2, "2026-08-18T10:00:00.000Z"],
  [2, 20, 1006, 3, "2026-08-25T15:00:00.000Z"],
  [2, 20, 1009, 3, "2026-09-02T12:30:00.000Z"],
  [2, 20, 1012, 1, "2026-09-11T17:15:00.000Z"],
  [2, 20, 1018, 3, "2026-09-26T11:45:00.000Z"],
  // Bottle 3, Bleu de Chanel: one sale
  [3, 10, 1011, 2, "2026-09-12T13:00:00.000Z"],
  // Bottle 4, 9 PM: just opened, nothing sold yet
  // Bottle 5, 9 PM: almost empty
  [5, 20, 1003, 1, "2026-07-28T10:00:00.000Z"],
  [5, 20, 1005, 1, "2026-08-08T12:00:00.000Z"],
  [5, 20, 1008, 3, "2026-08-27T16:00:00.000Z"],
  [5, 20, 1014, 1, "2026-09-15T09:20:00.000Z"],
  [5, 10, 1025, 1, "2026-10-10T14:00:00.000Z"],
  // Bottle 6, Imagination: reserved, a few sales
  [6, 10, 1020, 1, "2026-10-03T11:00:00.000Z"],
  [6, 20, 1027, 1, "2026-10-14T15:30:00.000Z"],
  // Bottle 7, CK One 200 ml
  [7, 20, 1007, 2, "2026-08-10T10:00:00.000Z"],
  [7, 20, 1013, 3, "2026-09-14T12:00:00.000Z"],
  [7, 10, 1019, 3, "2026-09-29T17:00:00.000Z"],
  [7, 20, 1028, 2, "2026-10-16T11:30:00.000Z"],
  // Bottle 8, CK One: used up then retired
  ...Array.from({ length: 10 }, (_, i): RawOp => [8, 20, 900 + i, 2, `2026-06-${String(14 + i * 1).padStart(2, "0")}T10:00:00.000Z`]),
];

export const mockOperations: DecantOperation[] = rawOps.map(([decantBottleId, quantityMl, orderId, employeeId, performedAt, reverses], index) => {
  const employee = users.find((user) => user.id === employeeId)!;
  return {
    id: index + 1,
    decantBottleId,
    employeeId,
    quantityMl,
    orderId,
    oppType: reverses ? "REVERSAL" : "CONSUMPTION",
    reversedOperationId: reverses ?? null,
    performedAt,
    employee: { firstName: employee.firstName, lastName: employee.lastName },
  };
});

export const mockBottles: DecantBottle[] = rawBottles.map((raw) => {
  const parfum = mockParfums.find((p) => p.id === raw.parfumId)!;
  const batch = mockBatches.find((b) => b.id === raw.stockBatchId)!;
  const ops = mockOperations.filter((op) => op.decantBottleId === raw.id);
  const consumptions = ops.filter((op) => op.oppType === "CONSUMPTION");

  // remaining = initial − consumed + given back (reversals)
  const consumed = consumptions.reduce((sum, op) => sum + op.quantityMl, 0);
  const reversed = ops.filter((op) => op.oppType === "REVERSAL").reduce((sum, op) => sum + op.quantityMl, 0);
  const lastDecantedAt = consumptions.length ? consumptions[consumptions.length - 1].performedAt : null;
  const reservedBy = users.find((user) => user.id === raw.reservedById) ?? null;

  return {
    ...raw,
    initialVolumeMl: parfum.originalVolume,
    remainingVolumeMl: parfum.originalVolume - consumed + reversed,
    lastDecantedAt,
    updatedAt: ops.length ? ops[ops.length - 1].performedAt : raw.createdAt,
    parfum: { id: parfum.id, name: parfum.name, originalVolume: parfum.originalVolume, brand: parfum.brand },
    stockBatch: {
      id: batch.id,
      quantity: batch.quantity,
      receivedAt: batch.receivedAt,
      purchaseCostPerBottle: batch.purchaseCostPerBottle,
    },
    reservedBy,
  };
});
