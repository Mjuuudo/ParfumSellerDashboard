"use client";

import Link from "next/link";
import { Plus, Search, Pencil, Power, Tags } from "lucide-react";
import type { Brand } from "./_components/brand";
import BrandAvatar from "./_components/BrandAvatar";
import { BrandsEmpty, BrandsError, BrandsLoading } from "./_components/BrandStates";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "../../_components/Toast";

export default function BrandsPage() {

  // TODO(you): replace this with state (useState<Brand[]>) and fill it from
  // the brands endpoint we'll build together, in a useEffect — same pattern as app/dashboard/users/page.tsx.
  // Also add loading/error state and pick the matching component from ./_components/BrandStates.
  const [brands, setBrands] = useState<Brand[]>([]);
  const router = useRouter();
  const toast = useToast();

  // Loading / error state of the list (same approach as the decant bottles page).
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // +1 → the useEffect below runs again

  // useEffect()
  useEffect(() => {
    const fetchItems = async ( ) => {
      try {
      const data = await fetch("http://localhost:8000/api/brand", {
        method: "get",
        credentials: "include",

      });

      if ( data.status === 401 ) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push('/login');
        return ;
      }
      if (!data.ok) {
        toast.error("Error While Fetching Data !");
        setError(true);
        return ;
      }

      const Brands = await data.json();
      setBrands(Brands);

      } catch {
        toast.error("Could not reach the server.");
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchItems()
  }, [reloadKey, router, toast])

  // "Try again" button of the error state.
  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };


  // Called when the on/off (Power) button of a brand is clicked, in the table or on a mobile card.
  // `brand` is the brand of the row that was clicked.
  const handleToggleStatus = async (brand: Brand) => {
    // TODO(you):
    // 1. Send a PATCH to /api/brand/${brand.id} with the opposite of brand.isActive (a real boolean).
    // 2. If the response is not ok, alert and stop.
    // 3. Update that one brand in `brands` with setBrands, so the badge changes without a reload.
  
    const updatedStatus = {
      ...(brand.isActive === true && {
        isActive: false,
      }),
      ...(brand.isActive === false && {
        isActive: true,
      }),

    }


    const data = await fetch(`http://localhost:8000/api/brand/${brand.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedStatus)
    });


    if ( !data.ok ) {
      toast.error(`error while Modifying Status ${data.status}`);
      return ;
    }

    return ;
  };


  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage the perfume houses in your catalog.
          </p>
        </div>

        <Link
          href="/dashboard/brands/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <Plus size={18} />
          Add Brand
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Brands</p>
          <p className="mt-3 text-3xl font-bold">
            {/* TODO(you): brands.length */}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Active</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {/* TODO(you): count brands where isActive is true */}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Inactive</p>
          <p className="mt-3 text-3xl font-bold text-red-400">
            {/* TODO(you): count brands where isActive is false */}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
        <Search size={19} className="shrink-0 text-slate-500" />
        {/* TODO(you): store the text in state (onChange) and filter the brands by name. */}
        <input
          type="search"
          placeholder="Search brands by name..."
          aria-label="Search brands"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Brands list */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <Tags className="text-amber-400" size={20} />
          <h2 className="font-semibold">All Brands</h2>
        </div>

        {loading ? (
          <BrandsLoading />
        ) : error ? (
          <BrandsError onRetry={retry} />
        ) : brands.length === 0 ? (
          <BrandsEmpty />
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Brand</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Last Updated</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {brands.map((brand) => (
                  <tr key={brand.id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <BrandAvatar name={brand.name} image={brand.image} />
                        <span className="font-medium text-slate-100">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={brand.isActive} />
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(brand.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <BrandActions brand={brand} onToggleStatus={handleToggleStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile: cards */}
            <ul className="divide-y divide-slate-800 md:hidden">
              {brands.map((brand) => (
                <li key={brand.id} className="flex items-center gap-3 px-4 py-4">
                  <BrandAvatar name={brand.name} image={brand.image} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-100">{brand.name}</p>
                    <div className="mt-1.5">
                      <StatusBadge isActive={brand.isActive} />
                    </div>
                  </div>
                  <BrandActions brand={brand} onToggleStatus={handleToggleStatus} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
          {/* TODO(you): e.g. "Showing 4 of 12 brands" once search is wired up */}
        </div>
      </div>
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

type BrandActionsProps = {
  brand: Brand;
  // Comes from BrandsPage (handleToggleStatus), because that's where the brands state lives.
  onToggleStatus: (brand: Brand) => void;
};

function BrandActions({ brand, onToggleStatus }: BrandActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/dashboard/brands/${brand.id}/edit`}
        aria-label={`Edit ${brand.name}`}
        title="Edit"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
      >
        <Pencil size={17} />
      </Link>

      <button
        type="button"
        onClick={() => onToggleStatus(brand)}
        aria-label={`${brand.isActive ? "Deactivate" : "Activate"} ${brand.name}`}
        title={brand.isActive ? "Deactivate" : "Activate"}
        className={`rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 ${
          brand.isActive ? "hover:text-red-400" : "hover:text-emerald-400"
        }`}
      >
        <Power size={17} />
      </button>
    </div>
  );
}
