"use client";

import { API_BASE_URL } from "@/app/_lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Power, Tags } from "lucide-react";
import type { Brand } from "../brands/_components/brand";
import BrandAvatar from "../brands/_components/BrandAvatar";
import PerfumeBottleOutline from "../_components/PerfumeBottleOutline";
import { formatPrice, type Parfum } from "./_components/parfum";
import { ParfumsEmpty, ParfumsError, ParfumsLoading } from "./_components/ParfumStates";
import { useRouter } from "next/navigation"
import { useToast } from "../../_components/Toast";


export default function ParfumsPage() {

  // TODO(you): fill these from the backend in a useEffect (same pattern as your brands page).
  // `brands` is used for the brand filter dropdown (and to show brand names if the
  // perfumes response doesn't include the brand).
  // Also add loading/error state and pick the matching component from ./_components/ParfumStates.
  const [parfums, setParfums] = useState<Parfum[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const router = useRouter();
  const toast = useToast();

  // Loading / error state of the list (same approach as the decant bottles page).
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // +1 → the useEffect below runs again


  useEffect( () => {
    const fetchParfums = async () => {
      try {
      const parfums = await fetch(`${API_BASE_URL}/parfum`, {
        method: "get",
        credentials: "include",
      })

        if (parfums.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push('/login');
        return ;
      }

      if (!parfums.ok){
        toast.error(`Error While fetching Data`);
        setError(true);
        return ;
      }

      setParfums(await parfums.json());

      const brands = await fetch (`${API_BASE_URL}/brand`, {
        method: "get",
        credentials: "include",
      })

      if (brands.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push('/login');
        return ;
      }

       if (!brands.ok){
        toast.error(`Error While fetching Data`);
        setError(true);
        return ;
      }

      setBrands(await brands.json());

      return ;

      } catch {
        toast.error("Could not reach the server.");
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchParfums();


  }, [reloadKey, router, toast]);

  // "Try again" button of the error state.
  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };


  // Called when the on/off (Power) button of a perfume is clicked, in the table or on a mobile card.
  const handleToggleStatus = async (parfum: Parfum) => {
    const newStatus = !parfum.isActive;

    console.log(newStatus);
    console.log(parfum.id);
    const data = await fetch(`${API_BASE_URL}/parfum/${parfum.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isActive: newStatus }),
    });

    if (data.status === 401) {
      toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
      router.push('/login');
      return ;
    }
    if (!data.ok) {
      toast.error(`Error While Modifying The Status ${data.status}`);
      return ;
    }

    // Update only the clicked perfume in state, so its badge changes without a reload.
    // .map() builds a NEW array: React only re-renders when state gets a new value,
    // so changing parfum.isActive directly would not update the screen.
    setParfums(parfums.map((item) =>
      item.id === parfum.id ? { ...item, isActive: newStatus } : item
    ));
  };

  // Summary figures, computed from the loaded perfumes.
  const ready = !loading && !error;
  const activeCount = parfums.filter((parfum) => parfum.isActive).length;
  const brandCount = new Set(parfums.map((parfum) => parfum.brandId)).size;

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfumes</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your catalog: bottle sizes and prices for full bottles and decants.
          </p>
        </div>

        <Link
          href="/dashboard/parfums/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <Plus size={18} />
          Add Perfume
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Perfumes</p>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            {ready ? parfums.length : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Active</p>
          <p className="mt-3 text-3xl font-bold tabular-nums text-emerald-400">
            {ready ? activeCount : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Brands Represented</p>
          <p className="mt-3 text-3xl font-bold tabular-nums text-amber-400">
            {ready ? brandCount : "—"}
          </p>
        </div>
      </div>

      {/* Search + brand filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
          <Search size={19} className="shrink-0 text-slate-500" />
          {/* TODO(you): store the text in state (onChange) and filter the perfumes by name. */}
          <input
            type="search"
            placeholder="Search perfumes by name..."
            aria-label="Search perfumes"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 sm:w-60">
          <Tags size={18} className="shrink-0 text-slate-500" />
          {/* TODO(you): store the selected brandId in state (onChange) and filter by it. "" = all brands. */}
          <select
            aria-label="Filter by brand"
            defaultValue=""
            className="w-full bg-transparent py-3 text-sm text-slate-300 outline-none [&>option]:bg-slate-900"
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Perfumes list */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <PerfumeBottleOutline className="h-5 w-5 text-amber-400" />
          <h2 className="font-semibold">All Perfumes</h2>
        </div>

        {loading ? (
          <ParfumsLoading />
        ) : error ? (
          <ParfumsError onRetry={retry} />
        ) : parfums.length === 0 ? (
          <ParfumsEmpty />
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Perfume</th>
                    <th className="px-6 py-4 font-medium">Brand</th>
                    <th className="px-6 py-4 text-right font-medium">Full Bottle</th>
                    <th className="px-6 py-4 text-right font-medium">10 ml</th>
                    <th className="px-6 py-4 text-right font-medium">20 ml</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {parfums.map((parfum) => (
                    <tr key={parfum.id} className="transition hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ParfumIcon />
                          <div>
                            <p className="font-medium text-slate-100">{parfum.name}</p>
                            <p className="text-xs text-slate-500">{parfum.originalVolume} ml</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <BrandCell parfum={parfum} />
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-100 tabular-nums">
                        {formatPrice(parfum.completePrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300 tabular-nums">
                        {formatPrice(parfum.decant10Price)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300 tabular-nums">
                        {formatPrice(parfum.decant20Price)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge isActive={parfum.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <ParfumActions parfum={parfum} onToggleStatus={handleToggleStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="divide-y divide-slate-800 md:hidden">
              {parfums.map((parfum) => (
                <li key={parfum.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <ParfumIcon />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-100">{parfum.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {parfum.brand?.name ?? "—"} · {parfum.originalVolume} ml
                      </p>
                    </div>
                    <ParfumActions parfum={parfum} onToggleStatus={handleToggleStatus} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Full", value: parfum.completePrice },
                      { label: "10 ml", value: parfum.decant10Price },
                      { label: "20 ml", value: parfum.decant20Price },
                    ].map((price) => (
                      <div key={price.label} className="rounded-lg bg-slate-950 px-2 py-2">
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">
                          {price.label}
                        </p>
                        <p className="mt-0.5 text-sm font-medium tabular-nums">
                          {formatPrice(price.value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <StatusBadge isActive={parfum.isActive} />
                </li>
              ))}
            </ul>
          </>
        )}

        {ready && parfums.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
            {/* TODO(you): once search and the filter are wired up, show "Showing X of Y perfumes" */}
            {parfums.length} perfume{parfums.length === 1 ? "" : "s"} · {activeCount} active · {brandCount} brand{brandCount === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </div>
  );
}

function ParfumIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
      <PerfumeBottleOutline className="h-6 w-6" />
    </div>
  );
}

function BrandCell({ parfum }: { parfum: Parfum }) {
  // TODO(you): if your API doesn't return `parfum.brand`, look the brand up in `brands`
  // by parfum.brandId and pass it here instead.
  if (!parfum.brand) {
    return <span className="text-slate-500">Brand #{parfum.brandId}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <BrandAvatar name={parfum.brand.name} image={parfum.brand.image} size="sm" />
      <span className="text-slate-300">{parfum.brand.name}</span>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

type ParfumActionsProps = {
  parfum: Parfum;
  // Comes from ParfumsPage (handleToggleStatus), because that's where the perfumes state lives.
  onToggleStatus: (parfum: Parfum) => void;
};

function ParfumActions({ parfum, onToggleStatus }: ParfumActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/dashboard/parfums/${parfum.id}/edit`}
        aria-label={`Edit ${parfum.name}`}
        title="Edit"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
      >
        <Pencil size={17} />
      </Link>

      <button
        type="button"
        onClick={() => onToggleStatus(parfum)}
        aria-label={`${parfum.isActive ? "Deactivate" : "Activate"} ${parfum.name}`}
        title={parfum.isActive ? "Deactivate" : "Activate"}
        className={`rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 ${
          parfum.isActive ? "hover:text-red-400" : "hover:text-emerald-400"
        }`}
      >
        <Power size={17} />
      </button>
    </div>
  );
}
