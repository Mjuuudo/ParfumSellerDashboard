"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, ChevronDown, CircleMinus, FlaskConical, Info, Lock, RotateCcw, Search } from "lucide-react";
import { useToast } from "../../_components/Toast";
import BrandAvatar from "../brands/_components/BrandAvatar";
import { LoadErrorCard, LoadingCard } from "../_components/LoadStateCards";
import {
  API_BASE,
  formatDate,
  formatDateTime,
  userName,
  type BrandSummary,
  type DecantOperation,
  type SellingType,
} from "../orders/_components/order";

type ActiveReservation = {
  id: number;
  quantity: number | null;
  quantityMl: number | null;
  orderItem: { id: number; orderId: number; sellingType: SellingType } | null;
};

type ParfumSummary = { id: number; name: string; originalVolume: number; brand: BrandSummary | null };

// GET /api/inventory
type Inventory = {
  batches: {
    id: number;
    quantity: number;
    unusedQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    receivedAt: string;
    parfum: ParfumSummary | null;
    reservations: ActiveReservation[];
  }[];
  bottles: {
    id: number;
    stockBatchId: number;
    initialVolumeMl: number;
    remainingVolumeMl: number;
    reservedVolumeMl: number;
    availableVolumeMl: number;
    isActive: boolean;
    createdAt: string;
    parfum: ParfumSummary | null;
    reservations: ActiveReservation[];
    recentOperations: DecantOperation[];
  }[];
};

export default function StockReservationsPage() {
  const router = useRouter();
  const toast = useToast();

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [onlyReserved, setOnlyReserved] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`${API_BASE}/inventory`, { credentials: "include" });
        if (response.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (!response.ok) {
          toast.error("Error While Fetching The Inventory");
          setLoadError(true);
          return;
        }
        setInventory(await response.json());
      } catch {
        toast.error("Could not reach the server.");
        setLoadError(true);
      }
    };

    fetchInventory();
  }, [reloadKey, router, toast]);

  const retry = () => {
    setLoadError(false);
    setReloadKey((key) => key + 1);
  };

  const search = query.trim().toLowerCase();
  const matches = (parfum: ParfumSummary | null) =>
    !search || `${parfum?.name ?? ""} ${parfum?.brand?.name ?? ""}`.toLowerCase().includes(search);

  const batches = (inventory?.batches ?? []).filter(
    (batch) => matches(batch.parfum) && (!onlyReserved || batch.reservedQuantity > 0),
  );
  const bottles = (inventory?.bottles ?? []).filter(
    (bottle) => matches(bottle.parfum) && (!onlyReserved || bottle.reservedVolumeMl > 0),
  );

  const totals = inventory && {
    sealed: inventory.batches.reduce((sum, batch) => sum + batch.unusedQuantity, 0),
    reservedBottles: inventory.batches.reduce((sum, batch) => sum + batch.reservedQuantity, 0),
    remainingMl: inventory.bottles.reduce((sum, bottle) => sum + bottle.remainingVolumeMl, 0),
    reservedMl: inventory.bottles.reduce((sum, bottle) => sum + bottle.reservedVolumeMl, 0),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock &amp; Reservations</h1>
        <p className="mt-2 text-sm text-slate-400">
          What you physically have, what pending orders are holding, and what is still free to sell.
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
        <Info size={16} className="mt-0.5 shrink-0 text-sky-400" />
        <span>
          <strong className="font-semibold text-slate-100">Available = physical − reserved.</strong> A pending order reserves
          stock without removing it; confirming the order removes it; cancelling releases it.
        </span>
      </p>

      {loadError ? (
        <LoadErrorCard what="the inventory" onRetry={retry} />
      ) : !inventory || !totals ? (
        <LoadingCard label="Loading inventory..." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Sealed bottles" value={totals.sealed} />
            <Stat label="Bottles reserved" value={totals.reservedBottles} accent="text-amber-400" />
            <Stat label="Decant ml left" value={`${totals.remainingMl.toLocaleString()} ml`} />
            <Stat label="Decant ml reserved" value={`${totals.reservedMl.toLocaleString()} ml`} accent="text-amber-400" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
              <Search size={19} className="shrink-0 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by perfume or brand..."
                aria-label="Search stock"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              <input type="checkbox" checked={onlyReserved} onChange={(event) => setOnlyReserved(event.target.checked)} className="accent-amber-500" />
              Only with reservations
            </label>
          </div>

          {/* Complete-bottle batches */}
          <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
              <Boxes className="text-amber-400" size={20} />
              <h2 className="font-semibold">Sealed bottles (stock batches)</h2>
            </div>
            {batches.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">No batch matches.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-3 font-medium">Batch</th>
                      <th className="px-6 py-3 font-medium">Perfume</th>
                      <th className="px-6 py-3 text-right font-medium">Received</th>
                      <th className="px-6 py-3 text-right font-medium">Sealed</th>
                      <th className="px-6 py-3 text-right font-medium">Reserved</th>
                      <th className="px-6 py-3 text-right font-medium">Available</th>
                      <th className="px-6 py-3 font-medium">Held by</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {batches.map((batch) => (
                      <tr key={batch.id} className="align-top">
                        <td className="px-6 py-3">
                          <p className="font-medium text-slate-100">#{batch.id}</p>
                          <p className="text-xs text-slate-500">{formatDate(batch.receivedAt)}</p>
                        </td>
                        <td className="px-6 py-3">
                          <PerfumeCell parfum={batch.parfum} />
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-slate-400">{batch.quantity}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-slate-200">{batch.unusedQuantity}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-amber-300">{batch.reservedQuantity}</td>
                        <td className="px-6 py-3 text-right">
                          <AvailablePill value={batch.availableQuantity} unit={batch.availableQuantity === 1 ? "bottle" : "bottles"} />
                        </td>
                        <td className="px-6 py-3">
                          <HeldBy reservations={batch.reservations} unit="bottle" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Opened bottles */}
          <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <FlaskConical className="text-amber-400" size={20} />
                <h2 className="font-semibold">Opened bottles (decants)</h2>
              </div>
              <Link href="/dashboard/decants/operations" className="text-sm text-slate-400 hover:text-amber-400">
                Full operation history →
              </Link>
            </div>
            {bottles.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">No opened bottle matches.</p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {bottles.map((bottle) => (
                  <BottleRow key={bottle.id} bottle={bottle} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function BottleRow({ bottle }: { bottle: Inventory["bottles"][number] }) {
  const [open, setOpen] = useState(false);
  const percent = (value: number) => (bottle.initialVolumeMl > 0 ? (value / bottle.initialVolumeMl) * 100 : 0);
  const free = percent(bottle.availableVolumeMl);
  const held = percent(bottle.reservedVolumeMl);

  return (
    <li className="px-6 py-4">
      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_auto]">
        <div className="flex min-w-0 items-center gap-3">
          <PerfumeCell parfum={bottle.parfum} />
          <Link href={`/dashboard/decants/${bottle.id}`} className="shrink-0 text-xs text-slate-500 hover:text-amber-400">
            Bottle #{bottle.id}
          </Link>
          {!bottle.isActive && <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">Retired</span>}
        </div>

        <div>
          {/* free | reserved | used */}
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
            <div className="bg-emerald-500" style={{ width: `${free}%` }} />
            <div className="bg-amber-400" style={{ width: `${held}%` }} />
          </div>
          <dl className="mt-2 grid grid-cols-4 gap-2 text-xs tabular-nums">
            <Measure label="Initial" value={bottle.initialVolumeMl} />
            <Measure label="Remaining" value={bottle.remainingVolumeMl} />
            <Measure label="Reserved" value={bottle.reservedVolumeMl} accent="text-amber-300" />
            <Measure label="Available" value={bottle.availableVolumeMl} accent="text-emerald-400" />
          </dl>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
        >
          {bottle.reservations.length} reservation{bottle.reservations.length === 1 ? "" : "s"} · {bottle.recentOperations.length} op.
          <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-slate-950 p-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Held by pending orders</p>
            <HeldBy reservations={bottle.reservations} unit="ml" />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Latest operations</p>
            {bottle.recentOperations.length === 0 ? (
              <p className="text-sm text-slate-500">No decant poured from this bottle yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {bottle.recentOperations.map((op) => (
                  <li key={op.id} className="flex items-start gap-2">
                    {op.oppType === "REVERSAL" ? (
                      <RotateCcw size={14} className="mt-0.5 shrink-0 text-sky-400" />
                    ) : (
                      <CircleMinus size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    )}
                    <span className="text-slate-300">
                      {op.oppType === "REVERSAL" ? "+" : "−"}
                      {op.quantityMl} ml ·{" "}
                      <Link href={`/dashboard/orders/${op.orderId}`} className="hover:text-amber-400">
                        order #{op.orderId}
                      </Link>
                      <span className="block text-xs text-slate-500">
                        {formatDateTime(op.performedAt)} · {userName(op.employee)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function HeldBy({ reservations, unit }: { reservations: ActiveReservation[]; unit: "bottle" | "ml" }) {
  if (reservations.length === 0) return <span className="text-sm text-slate-600">Nothing reserved</span>;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {reservations.map((reservation) => {
        const amount = unit === "ml" ? `${reservation.quantityMl} ml` : `${reservation.quantity} btl`;
        return (
          <li key={reservation.id}>
            <Link
              href={reservation.orderItem ? `/dashboard/orders/${reservation.orderItem.orderId}` : "#"}
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300 transition hover:bg-amber-500/20"
            >
              <Lock size={11} />
              #{reservation.orderItem?.orderId ?? "?"} · {amount}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function PerfumeCell({ parfum }: { parfum: ParfumSummary | null }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <BrandAvatar name={parfum?.brand?.name ?? ""} image={parfum?.brand?.image ?? null} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-100">{parfum?.name ?? "Unknown perfume"}</p>
        <p className="truncate text-xs text-slate-500">
          {parfum?.brand?.name ?? "—"} · {parfum?.originalVolume ?? "?"} ml
        </p>
      </div>
    </div>
  );
}

function AvailablePill({ value, unit }: { value: number; unit: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
        value > 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
      }`}
    >
      {value} {unit}
    </span>
  );
}

function Measure({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-semibold ${accent ?? "text-slate-200"}`}>{value} ml</dd>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-bold tabular-nums ${accent ?? ""}`}>{value}</p>
    </div>
  );
}
