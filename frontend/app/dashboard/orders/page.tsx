"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, CircleAlert, Filter, Plus, Search, ShoppingCart, UserRound } from "lucide-react";
import { useToast } from "../../_components/Toast";
import { formatPrice } from "../parfums/_components/parfum";
import {
  API_BASE,
  STATUS_LABELS,
  formatDate,
  readApiError,
  userName,
  type OrderListItem,
  type OrderStatus,
  type Session,
} from "./_components/order";
import { OrderStatusBadge } from "./_components/OrderBadges";
import { ACTION_META, OrderActionDialog, allowedActions, performOrderAction, type OrderAction } from "./_components/OrderActions";

const STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

export default function OrdersPage() {
  const router = useRouter();
  const toast = useToast();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Server-side filters (they re-run the request) + local search.
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");

  const [pending, setPending] = useState<{ action: OrderAction; order: OrderListItem } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const [ordersRes, sessionRes] = await Promise.all([
          fetch(`${API_BASE}/order?${params}`, { credentials: "include" }),
          fetch(`${API_BASE}/order/session`, { credentials: "include" }),
        ]);

        if (ordersRes.status === 401 || sessionRes.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (!ordersRes.ok) {
          toast.error((await readApiError(ordersRes, "Error While Fetching The Orders")).join(" · "));
          setError(true);
          return;
        }

        setOrders(await ordersRes.json());
        if (sessionRes.ok) setSession(await sessionRes.json());
        setError(false);
      } catch {
        toast.error("Could not reach the server.");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, from, to, reloadKey, router, toast]);

  const reload = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };

  const runAction = async () => {
    if (!pending) return;
    setBusy(true);
    const result = await performOrderAction(pending.action, pending.order.id);
    setBusy(false);

    if (!result.ok) {
      if (result.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push("/login");
        return;
      }
      toast.error(result.messages.join(" · "), "Action refused");
      setPending(null);
      reload();
      return;
    }

    toast.success(`Order #${result.order.id} is now ${STATUS_LABELS[result.order.status].toLowerCase()}.`, "Order updated");
    setPending(null);
    reload();
  };

  const search = query.trim().toLowerCase().replace(/^#/, "");
  const visibleOrders = orders.filter((order) => {
    if (!search) return true;
    return (
      String(order.id) === search ||
      order.customer?.fullName.toLowerCase().includes(search) ||
      order.customer?.phoneNumber.includes(search) ||
      userName(order.userCreator).toLowerCase().includes(search)
    );
  });

  const clearFilters = () => {
    setStatus("");
    setFrom("");
    setTo("");
    setQuery("");
  };

  const ready = !loading && !error;
  const hasFilters = Boolean(status || from || to || query);
  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const revenue = orders
    .filter((order) => order.status === "COMFIRMED" || order.status === "DELIVERD")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="mt-2 text-sm text-slate-400">
            New orders reserve their stock; confirming deducts it; cancelling releases it.
          </p>
        </div>
        <Link
          href="/dashboard/orders/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <Plus size={18} />
          New Order
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label={hasFilters ? "Orders (filtered)" : "Orders"} value={ready ? orders.length : "—"} />
        <SummaryCard label="Pending (stock reserved)" value={ready ? pendingCount : "—"} accent="text-amber-400" />
        <SummaryCard label="Confirmed + delivered revenue" value={ready ? formatPrice(revenue) : "—"} accent="text-emerald-400" />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
          <Search size={19} className="shrink-0 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by order #, customer, phone or creator..."
            aria-label="Search orders"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 lg:w-48">
          <Filter size={16} className="shrink-0 text-slate-500" />
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setLoading(true);
              setStatus(event.target.value as OrderStatus | "");
            }}
            className="w-full bg-transparent py-3 text-sm text-slate-300 outline-none [&>option]:bg-slate-900"
          >
            <option value="">Any status</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <DateFilter label="From" value={from} onChange={(value) => { setLoading(true); setFrom(value); }} />
        <DateFilter label="To" value={to} onChange={(value) => { setLoading(true); setTo(value); }} />
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-amber-400" size={20} />
            <h2 className="font-semibold">All Orders</h2>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-xs text-slate-400 transition hover:text-amber-400">
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <ListError onRetry={reload} />
        ) : orders.length === 0 && !hasFilters ? (
          <EmptyOrders />
        ) : visibleOrders.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h3 className="font-semibold">No matching orders</h3>
            <p className="mt-1 text-sm text-slate-400">Try another status, date range or search.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Created by</th>
                    <th className="px-6 py-4 font-medium">Items</th>
                    <th className="px-6 py-4 text-right font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {visibleOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-slate-100 hover:text-amber-400">
                          #{order.id}
                        </Link>
                        <p className="text-xs text-slate-500">{formatDate(order.pendingAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-200">{order.customer?.fullName ?? `Customer #${order.customerId}`}</p>
                        <p className="text-xs text-slate-500">{order.customer?.phoneNumber}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound size={14} className="shrink-0" />
                          {userName(order.userCreator)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{itemsSummary(order)}</td>
                      <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-100">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <RowActions order={order} session={session} onAction={(action) => setPending({ action, order })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <ul className="divide-y divide-slate-800 lg:hidden">
              {visibleOrders.map((order) => (
                <li key={order.id} className="space-y-3 px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-slate-100 hover:text-amber-400">
                        Order #{order.id}
                      </Link>
                      <p className="truncate text-sm text-slate-300">{order.customer?.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(order.pendingAt)} · by {userName(order.userCreator)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">{itemsSummary(order)}</span>
                    <span className="font-semibold tabular-nums">{formatPrice(order.total)}</span>
                  </div>
                  <RowActions order={order} session={session} onAction={(action) => setPending({ action, order })} />
                </li>
              ))}
            </ul>
          </>
        )}

        {ready && orders.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
            Showing {visibleOrders.length} of {orders.length} orders
          </div>
        )}
      </div>

      {pending && (
        <OrderActionDialog
          action={pending.action}
          orderId={pending.order.id}
          status={pending.order.status}
          busy={busy}
          onClose={() => setPending(null)}
          onConfirm={runAction}
        />
      )}
    </div>
  );
}

function itemsSummary(order: OrderListItem) {
  const units = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  return `${order.itemCount} line${order.itemCount === 1 ? "" : "s"} · ${units} unit${units === 1 ? "" : "s"}`;
}

function RowActions({
  order,
  session,
  onAction,
}: {
  order: OrderListItem;
  session: Session | null;
  onAction: (action: OrderAction) => void;
}) {
  const actions = allowedActions(order.status, session);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {actions.map((action) => {
        const meta = ACTION_META[action];
        const Icon = meta.icon;
        return (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            title={meta.label}
            aria-label={`${meta.label} order #${order.id}`}
            className={`rounded-lg p-2 transition ${
              action === "cancel"
                ? "text-slate-400 hover:bg-slate-800 hover:text-red-400"
                : action === "confirm"
                  ? "text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-sky-400"
            }`}
          >
            <Icon size={17} />
          </button>
        );
      })}
      <Link
        href={`/dashboard/orders/${order.id}`}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
      >
        Details
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

function DateFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-slate-400">
      <CalendarDays size={16} className="shrink-0 text-slate-500" />
      <span className="shrink-0">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent py-3 text-slate-300 outline-none [color-scheme:dark]"
      />
    </label>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-bold tabular-nums sm:text-3xl ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading orders" className="divide-y divide-slate-800">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
          <div className="h-3 w-14 rounded bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-44 rounded bg-slate-800" />
            <div className="h-3 w-28 rounded bg-slate-800/70" />
          </div>
          <div className="hidden h-3 w-20 rounded bg-slate-800 sm:block" />
          <div className="h-6 w-20 rounded-full bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function ListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
        <CircleAlert size={26} />
      </div>
      <h3 className="mt-4 font-semibold">Couldn&apos;t load orders</h3>
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

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
        <ShoppingCart size={26} />
      </div>
      <h3 className="mt-4 font-semibold">No orders yet</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        Create an order to reserve complete bottles and decants for a customer.
      </p>
      <Link
        href="/dashboard/orders/create"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        <Plus size={17} />
        New Order
      </Link>
    </div>
  );
}
