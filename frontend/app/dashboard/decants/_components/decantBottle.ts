// Types + derived values for the Decant Bottles screens.
//
// A DecantBottle is an ORIGINAL perfume bottle that was opened to sell decants from,
// not a 10/20 ml retail decant.
//
// Shape = exactly what GET /api/bottle (list) and GET /api/bottle/:id return
// (see listAllBottles / getBottleById in backend/src/decantBottle/bottle.service.ts).
// Dates arrive as ISO strings.

export type DecantBottle = {
  // ── DecantBottle columns ──
  id: number;
  parfumId: number;
  stockBatchId: number;
  initialVolumeMl: number; // set by the backend from Parfum.originalVolume when opened
  remainingVolumeMl: number; // starts equal to initialVolumeMl, goes down with each decant sold
  reservedAt: string | null;
  reservedById: number | null; // only the id: the `reservedBy` user isn't included by the backend
  lastDecantedAt: string | null;
  isActive: boolean;
  createdAt: string; // = the date the bottle was opened
  updatedAt: string;

  // ── Included by the backend: the batch, with the perfume nested INSIDE it ──
  stockBatch: {
    quantity: number;
    unusedQuantity: number;
    purchaseCostPerBottle: number;
    parfum: {
      name: string;
      originalVolume: number;
      completePrice: number;
      brand: { name: string }; // no `image` selected → avatars show the placeholder
    };
    receivedByUser: { id: number; username: string; email: string };
  };
};

// Mirrors the DecantOpperation model: one decant poured from (or given back to) a bottle.
export type DecantOperation = {
  id: number;
  decantBottleId: number;
  employeeId: number;
  quantityMl: number;
  orderId: number;
  oppType: "CONSUMPTION" | "REVERSAL";
  reversedOperationId: number | null; // for a REVERSAL: the CONSUMPTION it cancels
  performedAt: string;
  employee?: { firstName: string; lastName: string };
};

// ── UI-only derived values (NOT stored in the database) ──

// Below this, the bottle can't fill a 20 ml decant anymore. ⚠ Design decision, see notes.
export const LOW_VOLUME_THRESHOLD_ML = 20;

export type BottleStatus = "available" | "low" | "empty" | "retired";

// Derived from isActive + remainingVolumeMl. There is no `status` column in the schema.
export function getBottleStatus(bottle: DecantBottle): BottleStatus {
  if (!bottle.isActive) return "retired";
  if (bottle.remainingVolumeMl <= 0) return "empty";
  if (bottle.remainingVolumeMl < LOW_VOLUME_THRESHOLD_ML) return "low";
  return "available";
}

export const BOTTLE_STATUS_LABELS: Record<BottleStatus, string> = {
  available: "Available",
  low: "Low",
  empty: "Empty",
  retired: "Retired",
};

// Consumed volume = Initial volume − Remaining volume
export function consumedMl(bottle: DecantBottle) {
  return bottle.initialVolumeMl - bottle.remainingVolumeMl;
}

export function remainingPercent(bottle: DecantBottle) {
  if (bottle.initialVolumeMl <= 0) return 0;
  return Math.round((bottle.remainingVolumeMl / bottle.initialVolumeMl) * 100);
}

// Fixed locale + UTC so server and browser render the same text (no hydration mismatch).
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}
