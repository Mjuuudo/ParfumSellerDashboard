"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

// Popup notifications (bottom-right on desktop, top on mobile), used instead of alert().
//
//   const toast = useToast();
//   toast.error("Error While Fetching Data !");
//   toast.success("Brand created");
//   toast.info("No Fields Were Changed", "Nothing to save");   ← optional 2nd arg = title
//
// They close by themselves after a few seconds, or with their X button.

type ToastKind = "error" | "success" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
};

type ToastApi = {
  error: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DURATION_MS = { error: 6000, success: 4000, info: 4000 };
const DEFAULT_TITLES = { error: "Something went wrong", success: "Done", info: "Heads up" };

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastKind, message: string, title?: string) => {
      const id = nextId++;
      // Keep at most 4 on screen: the oldest one goes away first.
      setToasts((current) => [...current.slice(-3), { id, kind, message, title: title ?? DEFAULT_TITLES[kind] }]);
      setTimeout(() => dismiss(id), DURATION_MS[kind]);
    },
    [dismiss],
  );

  // Stable object: safe to use inside useEffect without re-running it.
  const api = useMemo<ToastApi>(
    () => ({
      error: (message, title) => show("error", message, title),
      success: (message, title) => show("success", message, title),
      info: (message, title) => show("info", message, title),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-96"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast() must be used inside <ToastProvider> (see app/layout.tsx)");
  return api;
}

const styles: Record<ToastKind, { icon: typeof Info; accent: string; bar: string }> = {
  error: { icon: CircleAlert, accent: "border-red-500/30 bg-red-500/10 text-red-400", bar: "bg-red-500" },
  success: { icon: CircleCheck, accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", bar: "bg-emerald-500" },
  info: { icon: Info, accent: "border-sky-500/30 bg-sky-500/10 text-sky-400", bar: "bg-sky-500" },
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const { icon: Icon, accent, bar } = styles[toast.kind];

  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      className="toast-enter pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/95 p-4 pr-10 text-slate-100 shadow-2xl shadow-black/40 backdrop-blur"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold">{toast.title}</p>
        <p className="mt-0.5 break-words text-sm text-slate-400">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="absolute right-2 top-2 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
      >
        <X size={15} />
      </button>
    </div>
  );
}
