import { STATUS_LABELS, type OrderStatus, type ReservationStatus } from "./order";

const statusStyles: Record<OrderStatus, { badge: string; dot: string }> = {
  PENDING: { badge: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400" },
  COMFIRMED: { badge: "bg-sky-500/15 text-sky-300", dot: "bg-sky-400" },
  DELIVERD: { badge: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
  CANCELLED: { badge: "bg-red-500/15 text-red-400", dot: "bg-red-400" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = statusStyles[status] ?? statusStyles.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const reservationStyles: Record<ReservationStatus, string> = {
  RESERVED: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  CONSUMED: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  RELEASED: "border-slate-600 bg-slate-800 text-slate-400",
};

const reservationLabels: Record<ReservationStatus, string> = {
  RESERVED: "Reserved",
  CONSUMED: "Consumed",
  RELEASED: "Released",
};

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${reservationStyles[status]}`}>
      {reservationLabels[status]}
    </span>
  );
}

export function OperationBadge({ type }: { type: "CONSUMPTION" | "REVERSAL" }) {
  return type === "CONSUMPTION" ? (
    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
      Consumption
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-300">
      Reversal
    </span>
  );
}
