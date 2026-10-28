import Link from "next/link";
import { CircleAlert, UserPlus, UsersRound } from "lucide-react";

// States of the customers list: loading → error → empty → no search results.

export function CustomersLoading() {
  return (
    <div aria-busy="true" aria-label="Loading customers" className="divide-y divide-slate-800">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
          <div className="h-10 w-10 rounded-full bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-slate-800" />
            <div className="h-3 w-56 rounded bg-slate-800/70" />
          </div>
          <div className="hidden h-3 w-28 rounded bg-slate-800 sm:block" />
          <div className="hidden h-6 w-16 rounded-full bg-slate-800 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function CustomersEmpty() {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
        <UsersRound size={26} />
      </div>
      <h3 className="mt-4 font-semibold">No customers yet</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        Add the people you sell to, so you can attach them to their orders.
      </p>
      <Link
        href="/dashboard/customers/create"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        <UserPlus size={17} />
        Add Customer
      </Link>
    </div>
  );
}

export function CustomersNoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="px-6 py-14 text-center">
      <h3 className="font-semibold">No matching customers</h3>
      <p className="mt-1 text-sm text-slate-400">Try another name, email or phone number.</p>
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

export function CustomersError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
        <CircleAlert size={26} />
      </div>
      <h3 className="mt-4 font-semibold">Couldn&apos;t load customers</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">Something went wrong while contacting the server.</p>
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
