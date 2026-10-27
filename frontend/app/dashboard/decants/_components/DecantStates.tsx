import Link from "next/link";
import { CircleAlert, FlaskConical, PackageOpen } from "lucide-react";

export function DecantsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading decant bottles" className="divide-y divide-slate-800">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
          <div className="h-11 w-11 rounded-lg bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-44 rounded bg-slate-800" />
            <div className="h-1.5 w-56 rounded-full bg-slate-800/70" />
          </div>
          <div className="hidden h-6 w-20 rounded-full bg-slate-800 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function DecantsEmpty() {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
        <FlaskConical size={26} />
      </div>
      <h3 className="mt-4 font-semibold">No bottles opened for decanting</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        Open a full bottle from your stock to start selling 10 ml and 20 ml decants from it.
      </p>
      <Link
        href="/dashboard/decants/open"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        <PackageOpen size={17} />
        Open Bottle for Decanting
      </Link>
    </div>
  );
}

export function DecantsNoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="px-6 py-14 text-center">
      <h3 className="font-semibold">No bottles match these filters</h3>
      <p className="mt-1 text-sm text-slate-400">Try another name, status or volume range.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
      >
        Clear filters
      </button>
    </div>
  );
}

export function DecantsError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
        <CircleAlert size={26} />
      </div>
      <h3 className="mt-4 font-semibold">Couldn&apos;t load decant bottles</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        Something went wrong while contacting the server.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
