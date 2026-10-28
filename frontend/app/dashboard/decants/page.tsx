"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PackageOpen, Search, FlaskConical, ChevronRight, UserRound, Filter, History } from "lucide-react";
import BrandAvatar from "../brands/_components/BrandAvatar";
import {
  consumedMl,
  formatDate,
  getBottleStatus,
  remainingPercent,
  BOTTLE_STATUS_LABELS,
  LOW_VOLUME_THRESHOLD_ML,
  type BottleStatus,
  type DecantBottle,
} from "./_components/decantBottle";
import VolumeBar from "./_components/VolumeBar";
import BottleStatusBadge from "./_components/BottleStatusBadge";
import { DecantsEmpty, DecantsError, DecantsLoading, DecantsNoResults } from "./_components/DecantStates";
import { useToast } from "../../_components/Toast";
// import { useRouter } from "next/navigation"


type VolumeFilter = "all" | "high" | "medium" | "low";

const volumeFilters: { value: VolumeFilter; label: string }[] = [
  { value: "all", label: "Any volume" },
  { value: "high", label: "50% or more left" },
  { value: "medium", label: "Under 50% left" },
  { value: "low", label: `Under ${LOW_VOLUME_THRESHOLD_ML} ml left` },
];

export default function DecantBottlesPage() {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BottleStatus | "all">("all");
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("all");

  // ── Data from GET /api/bottle ──
  const [bottles, setBottles] = useState<DecantBottle[]>([]);
  const [loading, setLoading] = useState(true); // true → shows <DecantsLoading />
  const [error, setError] = useState(false); // true → shows <DecantsError /> with a Retry button
  const [reloadKey, setReloadKey] = useState(0); // +1 → the useEffect below runs again

  useEffect(() => {
  const fetchBottles = async () => {
    try {
      const data = await fetch(`http://localhost:8000/api/bottle`, {
        method: "get",
        credentials: "include",
       
      });

      if (data.status === 401 || data.status === 403) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push('/login');
        return ;
      }

      if (!data.ok) {
        toast.error(`Error While Fetching The Bottles ${data.status}`);
        setError(true);
        return ;
      }

      const result: DecantBottle[] = await data.json();
      setBottles(result);
    } catch {
      toast.error("Could not reach the server.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

    fetchBottles();
  }, [reloadKey, router, toast]);

  // "Retry" button of the error state: back to loading, then fetch again.
  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };

  const ready = !loading && !error;

  const visibleBottles = bottles.filter((bottle) => {
    const parfum = bottle.stockBatch.parfum;
    const text = `${parfum.name} ${parfum.brand.name}`.toLowerCase();
    if (query && !text.includes(query.trim().toLowerCase())) return false;
    if (statusFilter !== "all" && getBottleStatus(bottle) !== statusFilter) return false;
    const percent = remainingPercent(bottle);
    if (volumeFilter === "high" && percent < 50) return false;
    if (volumeFilter === "medium" && percent >= 50) return false;
    if (volumeFilter === "low" && bottle.remainingVolumeMl >= LOW_VOLUME_THRESHOLD_ML) return false;
    return true;
  });

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setVolumeFilter("all");
  };

  // Summary figures (over all bottles, not just the filtered ones)
  const inUse = bottles.filter((b) => ["available", "low"].includes(getBottleStatus(b)));
  const totalRemaining = inUse.reduce((sum, b) => sum + b.remainingVolumeMl, 0);
  const lowOrEmpty = bottles.filter((b) => ["low", "empty"].includes(getBottleStatus(b))).length;
  const reserved = bottles.filter((b) => b.reservedById !== null && b.isActive).length;

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Decant Bottles</h1>
          <p className="mt-2 text-sm text-slate-400">
            Original bottles opened to sell 10 ml and 20 ml decants, and how much is left in each.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/decants/operations"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <History size={18} />
            Operation History
          </Link>
          <Link
            href="/dashboard/decants/open"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            <PackageOpen size={18} />
            Open Bottle for Decanting
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Bottles in use" value={ready ? inUse.length : "—"} />
        <SummaryCard
          label="Perfume left to decant"
          value={ready ? `${totalRemaining.toLocaleString()} ml` : "—"}
          accent="text-amber-400"
        />
        <SummaryCard label="Low or empty" value={ready ? lowOrEmpty : "—"} accent="text-red-400" />
        <SummaryCard label="Reserved" value={ready ? reserved : "—"} accent="text-sky-400" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
          <Search size={19} className="shrink-0 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by perfume or brand..."
            aria-label="Search decant bottles"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:flex">
          <FilterSelect
            label="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as BottleStatus | "all")}
            options={[
              { value: "all", label: "Any status" },
              ...(Object.keys(BOTTLE_STATUS_LABELS) as BottleStatus[]).map((status) => ({
                value: status,
                label: BOTTLE_STATUS_LABELS[status],
              })),
            ]}
          />
          <FilterSelect
            label="Filter by remaining volume"
            value={volumeFilter}
            onChange={(value) => setVolumeFilter(value as VolumeFilter)}
            options={volumeFilters}
          />
        </div>
      </div>

      {/* Bottles list */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <FlaskConical className="text-amber-400" size={20} />
          <h2 className="font-semibold">Opened Bottles</h2>
        </div>

        {loading ? (
          <DecantsLoading />
        ) : error ? (
          <DecantsError onRetry={retry} />
        ) : bottles.length === 0 ? (
          <DecantsEmpty />
        ) : visibleBottles.length === 0 ? (
          <DecantsNoResults onReset={resetFilters} />
        ) : (
          <>
            {/* Desktop: table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Bottle</th>
                    <th className="px-6 py-4 font-medium">Perfume</th>
                    <th className="w-52 px-6 py-4 font-medium">Remaining</th>
                    <th className="px-6 py-4 text-right font-medium">Consumed</th>
                    <th className="px-6 py-4 font-medium">Batch</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Reserved By</th>
                    <th className="px-6 py-4 text-right font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {visibleBottles.map((bottle) => (
                    <tr key={bottle.id} className="transition hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-100">#{bottle.id}</p>
                        <p className="text-xs text-slate-500">Opened {formatDate(bottle.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <PerfumeCell bottle={bottle} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="mb-1.5 text-xs tabular-nums text-slate-300">
                          <span className="font-semibold text-slate-100">{bottle.remainingVolumeMl} ml</span>
                          <span className="text-slate-500"> of {bottle.initialVolumeMl} ml</span>
                        </p>
                        <VolumeBar remainingMl={bottle.remainingVolumeMl} initialMl={bottle.initialVolumeMl} />
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-slate-300">
                        {consumedMl(bottle)} ml
                      </td>
                      <td className="px-6 py-4 text-slate-400">#{bottle.stockBatchId}</td>
                      <td className="px-6 py-4">
                        <BottleStatusBadge status={getBottleStatus(bottle)} />
                      </td>
                      <td className="px-6 py-4">
                        <ReservedBy bottle={bottle} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DetailsLink bottle={bottle} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet: cards */}
            <ul className="divide-y divide-slate-800 lg:hidden">
              {visibleBottles.map((bottle) => (
                <li key={bottle.id}>
                  <Link
                    href={`/dashboard/decants/${bottle.id}`}
                    className="block space-y-3 px-4 py-4 transition hover:bg-slate-800/40 sm:px-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <PerfumeCell bottle={bottle} />
                      <BottleStatusBadge status={getBottleStatus(bottle)} />
                    </div>
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs tabular-nums">
                        <span>
                          <span className="font-semibold text-slate-100">{bottle.remainingVolumeMl} ml</span>
                          <span className="text-slate-500"> of {bottle.initialVolumeMl} ml left</span>
                        </span>
                        <span className="text-slate-500">{consumedMl(bottle)} ml used</span>
                      </div>
                      <VolumeBar remainingMl={bottle.remainingVolumeMl} initialMl={bottle.initialVolumeMl} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Bottle #{bottle.id}</span>
                      <span>Batch #{bottle.stockBatchId}</span>
                      <span>Opened {formatDate(bottle.createdAt)}</span>
                      <ReservedBy bottle={bottle} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {ready && bottles.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
            Showing {visibleBottles.length} of {bottles.length} bottles
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-bold tabular-nums sm:text-3xl ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 lg:w-52">
      <Filter size={16} className="shrink-0 text-slate-500" />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent py-3 text-sm text-slate-300 outline-none [&>option]:bg-slate-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PerfumeCell({ bottle }: { bottle: DecantBottle }) {
  const parfum = bottle.stockBatch.parfum;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <BrandAvatar name={parfum.brand.name} image={null} />
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-100">{parfum.name}</p>
        <p className="truncate text-xs text-slate-500">
          {parfum.brand.name} · {bottle.initialVolumeMl} ml bottle
        </p>
      </div>
    </div>
  );
}

function ReservedBy({ bottle }: { bottle: DecantBottle }) {
  if (bottle.reservedById === null) return <span className="text-slate-600">Not reserved</span>;

  // The backend only sends the id (no `reservedBy` include), so no name to show yet.
  return (
    <span className="inline-flex items-center gap-1.5 text-sky-300">
      <UserRound size={14} className="shrink-0" />
      User #{bottle.reservedById}
    </span>
  );
}

function DetailsLink({ bottle }: { bottle: DecantBottle }) {
  return (
    <Link
      href={`/dashboard/decants/${bottle.id}`}
      aria-label={`Details of bottle #${bottle.id}`}
      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
    >
      Details
      <ChevronRight size={16} />
    </Link>
  );
}
