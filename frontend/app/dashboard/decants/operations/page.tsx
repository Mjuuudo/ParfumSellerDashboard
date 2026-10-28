"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, CircleAlert, CircleMinus, Filter, History, Info, RotateCcw, Search } from "lucide-react";
import { useToast } from "../../../_components/Toast";
import BrandAvatar from "../../brands/_components/BrandAvatar";
import { LoadingCard } from "../../_components/LoadStateCards";
import { OperationBadge } from "../../orders/_components/OrderBadges";
import { API_BASE, formatDateTime, userName, type BrandSummary, type DecantOperation, type OperationType } from "../../orders/_components/order";

// GET /api/decant-operation (one row)
type OperationRow = DecantOperation & {
  decantBottle: {
    id: number;
    parfumId: number;
    initialVolumeMl: number;
    remainingVolumeMl: number;
    parfum: { id: number; name: string; originalVolume: number; brand: BrandSummary | null } | null;
  } | null;
  reversedOpperation: { id: number; performedAt: string } | null;
  reversedByOpperation: { id: number; performedAt: string } | null;
};

export default function DecantOperationsPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<LoadingCard label="Loading operations..." />}>
      <OperationsHistory />
    </Suspense>
  );
}

function OperationsHistory() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  const [operations, setOperations] = useState<OperationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Filters: type / bottle / order go to the server; perfume search is local.
  const [type, setType] = useState<OperationType | "">("");
  const [bottleId, setBottleId] = useState(searchParams.get("bottleId") ?? "");
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const params = new URLSearchParams();
        if (type) params.set("type", type);
        if (/^\d+$/.test(bottleId)) params.set("bottleId", bottleId);
        if (/^\d+$/.test(orderId)) params.set("orderId", orderId);

        const response = await fetch(`${API_BASE}/decant-operation?${params}`, { credentials: "include" });
        if (response.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (!response.ok) {
          toast.error("Error While Fetching The Decant Operations");
          setError(true);
          return;
        }
        setOperations(await response.json());
        setError(false);
      } catch {
        toast.error("Could not reach the server.");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, [type, bottleId, orderId, reloadKey, router, toast]);

  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };

  const search = query.trim().toLowerCase();
  const visible = operations.filter((op) => {
    if (!search) return true;
    const parfum = op.decantBottle?.parfum;
    return `${parfum?.name ?? ""} ${parfum?.brand?.name ?? ""} ${userName(op.employee)}`.toLowerCase().includes(search);
  });

  const hasFilters = Boolean(type || bottleId || orderId || query);
  const consumed = operations.filter((op) => op.oppType === "CONSUMPTION").reduce((sum, op) => sum + op.quantityMl, 0);
  const reversed = operations.filter((op) => op.oppType === "REVERSAL").reduce((sum, op) => sum + op.quantityMl, 0);

  const clearFilters = () => {
    setType("");
    setBottleId("");
    setOrderId("");
    setQuery("");
  };

  return (
    <div className="space-y-8">
      <Link href="/dashboard/decants" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400">
        <ArrowLeft size={17} />
        Back to Decant Bottles
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decant Operations</h1>
        <p className="mt-2 text-sm text-slate-400">Every pour from an opened bottle, and every reversal.</p>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
        <Info size={16} className="mt-0.5 shrink-0 text-sky-400" />
        <span>
          Operations are recorded <strong className="font-semibold text-slate-100">automatically</strong>: a consumption when an
          order is confirmed (one per bottle used), a reversal when a confirmed order is cancelled. There is nothing to
          enter here by hand. Sell decants through{" "}
          <Link href="/dashboard/orders/create" className="text-amber-400 hover:underline">
            a new order
          </Link>
          .
        </span>
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label={hasFilters ? "Operations (filtered)" : "Operations"} value={loading ? "—" : operations.length} />
        <Stat label="Millilitres poured" value={loading ? "—" : `${consumed.toLocaleString()} ml`} accent="text-amber-400" />
        <Stat label="Millilitres reversed" value={loading ? "—" : `${reversed.toLocaleString()} ml`} accent="text-sky-400" />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
          <Search size={19} className="shrink-0 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by perfume, brand or employee..."
            aria-label="Search operations"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 lg:w-44">
          <Filter size={16} className="shrink-0 text-slate-500" />
          <select
            aria-label="Filter by type"
            value={type}
            onChange={(event) => {
              setLoading(true);
              setType(event.target.value as OperationType | "");
            }}
            className="w-full bg-transparent py-3 text-sm text-slate-300 outline-none [&>option]:bg-slate-900"
          >
            <option value="">Any type</option>
            <option value="CONSUMPTION">Consumption</option>
            <option value="REVERSAL">Reversal</option>
          </select>
        </div>
        <IdFilter label="Bottle #" value={bottleId} onChange={(value) => { setLoading(true); setBottleId(value); }} />
        <IdFilter label="Order #" value={orderId} onChange={(value) => { setLoading(true); setOrderId(value); }} />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <History className="text-amber-400" size={20} />
            <h2 className="font-semibold">History</h2>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-xs text-slate-400 transition hover:text-amber-400">
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div aria-busy="true" className="divide-y divide-slate-800">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
                <div className="h-8 w-8 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 rounded bg-slate-800" />
                  <div className="h-3 w-32 rounded bg-slate-800/70" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
              <CircleAlert size={26} />
            </div>
            <h3 className="mt-4 font-semibold">Couldn&apos;t load the operations</h3>
            <button
              type="button"
              onClick={retry}
              className="mt-6 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h3 className="font-semibold">{hasFilters ? "No matching operation" : "No decant operation yet"}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {hasFilters ? "Try other filters." : "They appear here as soon as an order with decants is confirmed."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Operation</th>
                  <th className="px-6 py-3 font-medium">Bottle / perfume</th>
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 text-right font-medium">Volume</th>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">When</th>
                  <th className="px-6 py-3 font-medium">Reversal link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {visible.map((op) => (
                  <tr key={op.id}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {op.oppType === "REVERSAL" ? (
                          <RotateCcw size={15} className="text-sky-400" />
                        ) : (
                          <CircleMinus size={15} className="text-slate-400" />
                        )}
                        <span className="font-medium text-slate-100">#{op.id}</span>
                        <OperationBadge type={op.oppType} />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <BrandAvatar
                          name={op.decantBottle?.parfum?.brand?.name ?? ""}
                          image={op.decantBottle?.parfum?.brand?.image ?? null}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-slate-200">{op.decantBottle?.parfum?.name ?? "Unknown perfume"}</p>
                          <Link href={`/dashboard/decants/${op.decantBottleId}`} className="text-xs text-slate-500 hover:text-amber-400">
                            Bottle #{op.decantBottleId}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/orders/${op.orderId}`} className="text-slate-300 hover:text-amber-400">
                        #{op.orderId}
                      </Link>
                    </td>
                    <td className={`px-6 py-3 text-right font-semibold tabular-nums ${op.oppType === "REVERSAL" ? "text-sky-300" : "text-slate-100"}`}>
                      {op.oppType === "REVERSAL" ? "+" : "−"}
                      {op.quantityMl} ml
                    </td>
                    <td className="px-6 py-3 text-slate-400">{userName(op.employee)}</td>
                    <td className="px-6 py-3 text-xs text-slate-500">{formatDateTime(op.performedAt)}</td>
                    <td className="px-6 py-3 text-xs text-slate-400">
                      {op.reversedOpperation
                        ? `Reverses #${op.reversedOpperation.id}`
                        : op.reversedByOpperation
                          ? `Reversed by #${op.reversedByOpperation.id}`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function IdFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-slate-400 lg:w-36">
      <span className="shrink-0">{label}</span>
      <input
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        placeholder="any"
        className="w-full bg-transparent py-3 text-slate-300 outline-none placeholder:text-slate-600"
      />
    </label>
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
