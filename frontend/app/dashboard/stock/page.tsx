"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { PackagePlus, Search, Boxes, CalendarDays, UserRound, Pencil } from "lucide-react";
import type { Parfum } from "../parfums/_components/parfum";
import { formatPrice } from "../parfums/_components/parfum";
import PerfumeBottleOutline from "../_components/PerfumeBottleOutline";
import type { StockBatch } from "./_components/stockBatch";
import { StockEmpty } from "./_components/StockStates";
import { useRouter } from "next/navigation"


export default function StockPage() {

  // TODO(you): fill these from the backend in a useEffect (same pattern as your perfumes page).
  // `parfums` is used for the perfume filter dropdown.
  // Also add loading/error state and pick the matching component from ./_components/StockStates.
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [parfums, setParfums] = useState<Parfum[]>([]);
  const router = useRouter()
  useEffect( () => {
    const fetchData = async () => {
      const data = await fetch(`http://localhost:8000/api/parfum`, {
        method: "get",
        credentials: "include",
      })
      if (data.status === 401){
        router.push('/login');
        return ;
      }

      if (!data.ok) {
        alert("Data Fetching FAILED");
        return ;
      }

      setParfums(await data.json());
      const batches = await fetch(`http://localhost:8000/api/stock`, {
        method: "get",
        credentials: "include"
      });

      if ( !batches.ok ){
        alert("Data Fetching FAILED");
        return ;
      }

      setBatches( await batches.json())
    };

    fetchData();
  }, [])



  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="mt-2 text-sm text-slate-400">
            Every delivery of full bottles you received, with what you paid for them.
          </p>
        </div>

        <Link
          href="/dashboard/stock/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <PackagePlus size={18} />
          Record Delivery
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Deliveries</p>
          <p className="mt-3 text-3xl font-bold">
            {/* TODO(you): batches.length */}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Bottles Received</p>
          <p className="mt-3 text-3xl font-bold text-amber-400">
            {/* TODO(you): sum of quantity over all batches (hint: reduce) */}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Purchase Cost</p>
          <p className="mt-3 text-3xl font-bold">
            {/* TODO(you): sum of quantity × purchaseCostPerBottle, shown with formatPrice */}
          </p>
        </div>
      </div>

      {/* Search + perfume filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
          <Search size={19} className="shrink-0 text-slate-500" />
          {/* TODO(you): store the text in state (onChange) and filter batches by perfume name. */}
          <input
            type="search"
            placeholder="Search by perfume name..."
            aria-label="Search deliveries"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 sm:w-72">
          <PerfumeBottleOutline className="h-[18px] w-[18px] shrink-0 text-slate-500" />
          {/* TODO(you): store the selected parfumId in state (onChange) and filter by it. "" = all. */}
          <select
            aria-label="Filter by perfume"
            defaultValue=""
            className="w-full bg-transparent py-3 text-sm text-slate-300 outline-none [&>option]:bg-slate-900"
          >
            <option value="">All perfumes</option>
            {parfums.map((parfum) => (
              <option key={parfum.id} value={parfum.id}>
                {parfum.name} · {parfum.originalVolume} ml
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batches list */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <Boxes className="text-amber-400" size={20} />
          <h2 className="font-semibold">Stock Batches</h2>
        </div>

        {batches.length === 0 ? (
          <StockEmpty />
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Received</th>
                    <th className="px-6 py-4 font-medium">Perfume</th>
                    <th className="px-6 py-4 text-right font-medium">Bottles</th>
                    <th className="px-6 py-4 text-right font-medium">Cost / Bottle</th>
                    <th className="px-6 py-4 text-right font-medium">Total Cost</th>
                    <th className="px-6 py-4 font-medium">Received By</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="transition hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <p className="text-slate-100">
                          {new Date(batch.receivedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">Batch #{batch.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <ParfumCell batch={batch} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <QuantityPill quantity={batch.quantity} />
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300 tabular-nums">
                        {formatPrice(batch.purchaseCostPerBottle)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-100 tabular-nums">
                        {formatPrice(batch.quantity * batch.purchaseCostPerBottle)}
                      </td>
                      <td className="px-6 py-4">
                        <ReceivedBy batch={batch} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <EditBatchLink batch={batch} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="divide-y divide-slate-800 md:hidden">
              {batches.map((batch) => (
                <li key={batch.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <ParfumCell batch={batch} />
                    <div className="flex shrink-0 items-center gap-1">
                      <QuantityPill quantity={batch.quantity} />
                      <EditBatchLink batch={batch} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-950 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">Per bottle</p>
                      <p className="mt-0.5 text-sm tabular-nums">
                        {formatPrice(batch.purchaseCostPerBottle)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-950 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">Total</p>
                      <p className="mt-0.5 text-sm font-medium tabular-nums">
                        {formatPrice(batch.quantity * batch.purchaseCostPerBottle)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {new Date(batch.receivedAt).toLocaleDateString()}
                    </span>
                    <ReceivedBy batch={batch} />
                    <span>Batch #{batch.id}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
          {/* TODO(you): e.g. "Showing 4 of 12 deliveries" once search and the filter are wired up */}
        </div>
      </div>
    </div>
  );
}

function ParfumCell({ batch }: { batch: StockBatch }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
        <PerfumeBottleOutline className="h-6 w-6" />
      </div>
      {/* TODO(you): if your API doesn't return `batch.parfum`, look it up in `parfums` by batch.parfumId. */}
      {batch.parfum ? (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-100">{batch.parfum.name}</p>
          <p className="truncate text-xs text-slate-500">
            {batch.parfum.brand ? `${batch.parfum.brand.name} · ` : ""}
            {batch.parfum.originalVolume} ml
          </p>
        </div>
      ) : (
        <span className="text-slate-500">Perfume #{batch.parfumId}</span>
      )}
    </div>
  );
}

function EditBatchLink({ batch }: { batch: StockBatch }) {
  return (
    <Link
      href={`/dashboard/stock/${batch.id}/edit`}
      aria-label={`Edit batch #${batch.id}`}
      title="Edit"
      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
    >
      <Pencil size={17} />
    </Link>
  );
}

function QuantityPill({ quantity }: { quantity: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold tabular-nums text-amber-400">
      {quantity} {quantity === 1 ? "bottle" : "bottles"}
    </span>
  );
}

function ReceivedBy({ batch }: { batch: StockBatch }) {
  const user = batch.receivedByUser;

  return (
    <span className="inline-flex items-center gap-1.5 text-slate-400">
      <UserRound size={14} className="shrink-0" />
      {user ? `${user.firstName} ${user.lastName}` : `User #${batch.receivedBy}`}
    </span>
  );
}
