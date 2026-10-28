import { CircleAlert } from "lucide-react";

// Shown by the edit pages while their data loads, or when loading it failed.

export function LoadingCard({ label }: { label: string }) {
  return (
    <section
      aria-busy="true"
      className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8"
    >
      <p className="sr-only">{label}</p>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse space-y-2">
          <div className="h-3 w-28 rounded bg-slate-800" />
          <div className="h-11 rounded-lg bg-slate-800/70" />
        </div>
      ))}
      <div className="flex animate-pulse justify-end border-t border-slate-800 pt-6">
        <div className="h-11 w-36 rounded-lg bg-slate-800" />
      </div>
    </section>
  );
}

export function LoadErrorCard({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <section
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900 px-6 py-12 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
        <CircleAlert size={26} />
      </div>
      <h2 className="mt-4 font-semibold">Couldn&apos;t load {what}</h2>
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
    </section>
  );
}
