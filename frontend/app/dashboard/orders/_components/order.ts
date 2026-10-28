// Types + helpers for the order screens. Shapes mirror the real responses of
// backend/src/order (order.service.ts / inventory.service.ts). Dates arrive as ISO strings.

export const API_BASE = "http://localhost:8000/api";

export type OrderStatus = "PENDING" | "COMFIRMED" | "DELIVERD" | "CANCELLED";
export type SellingType = "COMPLETE" | "DECANT_10ML" | "DECANT_20ML";
export type ReservationStatus = "RESERVED" | "CONSUMED" | "RELEASED";
export type OperationType = "CONSUMPTION" | "REVERSAL";

export type UserSummary = { id: number; username: string; firstName: string; lastName: string };
export type BrandSummary = { name: string; image: string | null };

// GET /api/order (one row)
export type OrderListItem = {
  id: number;
  status: OrderStatus;
  deliveryAdress: string;
  deliveryPrice: number | null;
  pendingAt: string;
  verifiedAt: string | null;
  delivredAt: string | null;
  cancelledAt: string | null;
  updatedAt: string;
  createdBy: number;
  verifiedBy: number | null;
  cancelledBy: number | null;
  customerId: number;
  customer: { id: number; fullName: string; phoneNumber: string } | null;
  userCreator: UserSummary | null;
  orderItems: { id: number; sellingType: SellingType; quantity: number; totalPrice: number }[];
  itemCount: number;
  itemsTotal: number;
  total: number;
};

export type Reservation = {
  id: number;
  orderItemId: number;
  stockBatchId: number | null;
  quantity: number | null;
  decantBottleId: number | null;
  quantityMl: number | null;
  status: ReservationStatus;
  createdAt: string;
  consumedAt: string | null;
  releasedAt: string | null;
  stockBatch: { id: number; receivedAt: string; quantity: number } | null;
  decantBottle: { id: number; initialVolumeMl: number; createdAt: string } | null;
};

export type DecantOperation = {
  id: number;
  decantBottleId: number;
  employeeId: number;
  quantityMl: number;
  orderId: number;
  oppType: OperationType;
  reversedOperationId: number | null;
  performedAt: string;
  employee: UserSummary | null;
};

// GET /api/order/:id
export type OrderDetail = Omit<OrderListItem, "customer" | "orderItems" | "itemCount"> & {
  customer: { id: number; fullName: string; email: string; phoneNumber: string; address: string; isActive: boolean } | null;
  userVerifier: UserSummary | null;
  userCanceller: UserSummary | null;
  orderItems: {
    id: number;
    sellingType: SellingType;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    parfumId: number;
    parfum: { id: number; name: string; originalVolume: number; brand: BrandSummary | null } | null;
    stockReservations: Reservation[];
  }[];
  decantOpperations: DecantOperation[];
};

// GET /api/order/availability (one perfume)
export type PerfumeAvailability = {
  id: number;
  name: string;
  originalVolume: number;
  completePrice: number;
  decant10Price: number;
  decant20Price: number;
  brand: BrandSummary | null;
  availableBottles: number;
  availableMl: number;
  openBottles: number;
};

// GET /api/order/session
export type Session = { userId: number; username: string; role: "OWNER" | "EMPLOYEE" | string };

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  COMFIRMED: "Confirmed",
  DELIVERD: "Delivered",
  CANCELLED: "Cancelled",
};

export const SELLING_TYPE_LABELS: Record<SellingType, string> = {
  COMPLETE: "Complete bottle",
  DECANT_10ML: "10 ml decant",
  DECANT_20ML: "20 ml decant",
};

export const DECANT_SIZE_ML: Record<Exclude<SellingType, "COMPLETE">, number> = {
  DECANT_10ML: 10,
  DECANT_20ML: 20,
};

export function unitPriceOf(sellingType: SellingType, parfum: Pick<PerfumeAvailability, "completePrice" | "decant10Price" | "decant20Price">) {
  if (sellingType === "COMPLETE") return parfum.completePrice;
  if (sellingType === "DECANT_10ML") return parfum.decant10Price;
  return parfum.decant20Price;
}

// How many units of this selling type the current stock could cover (informative only).
export function maxUnits(sellingType: SellingType, parfum: Pick<PerfumeAvailability, "availableBottles" | "availableMl">) {
  if (sellingType === "COMPLETE") return parfum.availableBottles;
  return Math.floor(parfum.availableMl / DECANT_SIZE_ML[sellingType]);
}

export function userName(user: UserSummary | null | undefined) {
  if (!user) return "—";
  const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return full || user.username;
}

// Fixed locale + UTC so server and browser render the same text.
const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
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
  return `${dateTimeFormatter.format(new Date(iso))} UTC`;
}

// Reads the message NestJS sends back ({ message: string | string[] }).
export async function readApiError(response: Response, fallback: string): Promise<string[]> {
  try {
    const body = await response.json();
    if (Array.isArray(body?.message)) return body.message.map(String);
    if (typeof body?.message === "string") return [body.message];
  } catch {
    // empty or non-JSON body
  }
  return [fallback];
}
