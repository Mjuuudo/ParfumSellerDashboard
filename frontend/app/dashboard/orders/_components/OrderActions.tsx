"use client";

import { useEffect } from "react";
import { Ban, CircleCheck, Loader2, Truck } from "lucide-react";
import { API_BASE, readApiError, type OrderDetail, type OrderStatus, type Session } from "./order";

export type OrderAction = "confirm" | "deliver" | "cancel";

// Which buttons an order gets. The backend enforces the same rules (and is the authority):
// cancelling a CONFIRMED order is owner-only because its stock has already been used.
export function allowedActions(status: OrderStatus, session: Session | null): OrderAction[] {
  if (status === "PENDING") return ["confirm", "cancel"];
  if (status === "COMFIRMED") return session?.role === "OWNER" ? ["deliver", "cancel"] : ["deliver"];
  return [];
}

export type ActionResult =
  | { ok: true; order: OrderDetail }
  | { ok: false; status: number; messages: string[] };

export async function performOrderAction(action: OrderAction, orderId: number): Promise<ActionResult> {
  try {
    const response = await fetch(`${API_BASE}/order/${orderId}/${action}`, { method: "POST", credentials: "include" });
    if (!response.ok) {
      return { ok: false, status: response.status, messages: await readApiError(response, `Request failed (${response.status})`) };
    }
    return { ok: true, order: await response.json() };
  } catch {
    return { ok: false, status: 0, messages: ["Could not reach the server."] };
  }
}

export const ACTION_META: Record<OrderAction, { label: string; icon: typeof Truck; button: string }> = {
  confirm: {
    label: "Confirm",
    icon: CircleCheck,
    button: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
  },
  deliver: {
    label: "Mark delivered",
    icon: Truck,
    button: "bg-sky-500 text-slate-950 hover:bg-sky-400",
  },
  cancel: {
    label: "Cancel order",
    icon: Ban,
    button: "border border-red-500/40 text-red-300 hover:bg-red-500/10",
  },
};

function dialogText(action: OrderAction, status: OrderStatus) {
  if (action === "confirm") {
    return {
      title: "Confirm this order?",
      body: "The reserved stock is deducted now: sealed bottles leave their batch and the decant millilitres leave their bottles. One consumption operation is recorded per bottle used. This happens only once.",
      button: "Confirm & deduct stock",
    };
  }
  if (action === "deliver") {
    return {
      title: "Mark as delivered?",
      body: "Only the status and delivery date change. Stock was already deducted when the order was confirmed.",
      button: "Mark delivered",
    };
  }
  return status === "COMFIRMED"
    ? {
        title: "Cancel a confirmed order?",
        body: "Its stock has already been used. Cancelling puts the bottles and millilitres back and records a reversal operation for every consumption, so the history keeps both.",
        button: "Cancel & reverse stock",
      }
    : {
        title: "Cancel this order?",
        body: "Its reservations are released: the bottles and millilitres it was holding become available again. Nothing physical changes.",
        button: "Cancel & release stock",
      };
}

export function OrderActionDialog({
  action,
  orderId,
  status,
  busy,
  onClose,
  onConfirm,
}: {
  action: OrderAction;
  orderId: number;
  status: OrderStatus;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const text = dialogText(action, status);
  const meta = ACTION_META[action];
  const Icon = meta.icon;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [busy, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="order-action-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} disabled={busy} className="absolute inset-0 bg-slate-950/80" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-semibold tracking-widest text-amber-400">ORDER #{orderId}</p>
        <h2 id="order-action-title" className="mt-1 text-lg font-semibold">
          {text.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{text.body}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
              action === "cancel" ? "bg-red-500 text-white hover:bg-red-400" : meta.button
            }`}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
            {busy ? "Working..." : text.button}
          </button>
        </div>
      </div>
    </div>
  );
}
