import { BOTTLE_STATUS_LABELS, type BottleStatus } from "./decantBottle";

const styles: Record<BottleStatus, { badge: string; dot: string }> = {
  available: { badge: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
  low: { badge: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  empty: { badge: "bg-red-500/15 text-red-400", dot: "bg-red-400" },
  retired: { badge: "bg-slate-700/60 text-slate-400", dot: "bg-slate-500" },
};

// Status derived in the UI from isActive + remainingVolumeMl (see getBottleStatus).
export default function BottleStatusBadge({ status }: { status: BottleStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${styles[status].badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles[status].dot}`} />
      {BOTTLE_STATUS_LABELS[status]}
    </span>
  );
}
