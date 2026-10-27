import Link from "next/link";
import { Boxes, CircleAlert, PackagePlus } from "lucide-react";

// Ready-made designs for the list page. The page only renders <StockEmpty /> for now;
// TODO(you): once you fetch the batches, decide which one to show (loading → error → empty → table).

export function StockLoading() {
  return (
    <div aria-busy="true" aria-label="Loading stock batches" className="divide-y divide-slate-800">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
          <div className="h-3 w-20 rounded bg-slate-800" />
          <div className="h-11 w-11 rounded-lg bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-44 rounded bg-slate-800" />
            <div className="h-3 w-24 rounded bg-slate-800/70" />
          </div>
          <div className="hidden h-3 w-28 rounded bg-slate-800 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function StockEmpty() {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
        <Boxes size={26} />
      </div>
      <h3 className="mt-4 font-semibold">No deliveries recorded yet</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        Each time bottles arrive from a supplier, record them here to track your stock and costs.
      </p>
      <Link
        href="/dashboard/stock/create"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        <PackagePlus size={17} />
        Record Delivery
      </Link>
    </div>
  );
}

// For when the search / perfume filter returns nothing (different from "no batches at all").
export function StockNoResults() {
  return (
    <div className="px-6 py-14 text-center">
      <h3 className="font-semibold">No matching deliveries</h3>
      <p className="mt-1 text-sm text-slate-400">Try a different perfume name.</p>
    </div>
  );
}

export function StockError({ message }: { message?: string }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
        <CircleAlert size={26} />
      </div>
      <h3 className="mt-4 font-semibold">Couldn&apos;t load stock</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        {message ?? "Something went wrong while contacting the server."}
      </p>
      {/* TODO(you): add an onClick that runs your fetch again. */}
      <button
        type="button"
        className="mt-6 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
