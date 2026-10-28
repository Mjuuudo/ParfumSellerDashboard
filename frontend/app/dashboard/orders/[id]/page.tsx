"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Boxes,
  CircleCheck,
  CircleMinus,
  Clock,
  FlaskConical,
  History,
  Info,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Truck,
  UserRound,
} from "lucide-react";
import { useToast } from "../../../_components/Toast";
import BrandAvatar from "../../brands/_components/BrandAvatar";
import { formatPrice } from "../../parfums/_components/parfum";
import { LoadErrorCard, LoadingCard } from "../../_components/LoadStateCards";
import {
  API_BASE,
  SELLING_TYPE_LABELS,
  STATUS_LABELS,
  formatDateTime,
  userName,
  type OrderDetail,
  type Session,
} from "../_components/order";
import { OperationBadge, OrderStatusBadge, ReservationBadge } from "../_components/OrderBadges";
import { ACTION_META, OrderActionDialog, allowedActions, performOrderAction, type OrderAction } from "../_components/OrderActions";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [pendingAction, setPendingAction] = useState<OrderAction | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const [orderRes, sessionRes] = await Promise.all([
          fetch(`${API_BASE}/order/${id}`, { credentials: "include" }),
          fetch(`${API_BASE}/order/session`, { credentials: "include" }),
        ]);

        if (orderRes.status === 401 || sessionRes.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (orderRes.status === 404 || orderRes.status === 400) {
          setNotFound(true);
          return;
        }
        if (!orderRes.ok) {
          toast.error("Error While Fetching The Order");
          setLoadError(true);
          return;
        }

        setOrder(await orderRes.json());
        if (sessionRes.ok) setSession(await sessionRes.json());
      } catch {
        toast.error("Could not reach the server.");
        setLoadError(true);
      }
    };

    fetchOrder();
  }, [id, reloadKey, router, toast]);

  const retry = () => {
    setLoadError(false);
    setReloadKey((key) => key + 1);
  };

  const runAction = async () => {
    if (!pendingAction || !order) return;
    setBusy(true);
    const result = await performOrderAction(pendingAction, order.id);
    setBusy(false);
    setPendingAction(null);

    if (!result.ok) {
      if (result.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push("/login");
        return;
      }
      toast.error(result.messages.join(" · "), "Action refused");
      retry(); // show the order as it really is now
      return;
    }

    setOrder(result.order);
    toast.success(`Order #${result.order.id} is now ${STATUS_LABELS[result.order.status].toLowerCase()}.`, "Order updated");
  };

  if (notFound || loadError || !order) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <BackLink />
        {notFound ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h1 className="text-xl font-semibold">Order #{id} not found</h1>
            <p className="mt-2 text-sm text-slate-400">It may not exist, or the link is wrong.</p>
          </section>
        ) : loadError ? (
          <LoadErrorCard what="this order" onRetry={retry} />
        ) : (
          <LoadingCard label="Loading order..." />
        )}
      </div>
    );
  }

  const actions = allowedActions(order.status, session);
  const reservations = order.orderItems.flatMap((item) =>
    item.stockReservations.map((reservation) => ({ reservation, item })),
  );
  const operations = [...order.decantOpperations].sort((a, b) => a.id - b.id);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <BackLink />

      {/* Header */}
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-widest text-amber-400">ORDER #{order.id}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{formatPrice(order.total)}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Created {formatDateTime(order.pendingAt)} by {userName(order.userCreator)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <OrderStatusBadge status={order.status} />
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => {
                const meta = ACTION_META[action];
                const Icon = meta.icon;
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setPendingAction(action)}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${meta.button}`}
                  >
                    <Icon size={16} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}
          {order.status === "COMFIRMED" && session && session.role !== "OWNER" && (
            <p className="text-xs text-slate-500">Only an owner can cancel a confirmed order.</p>
          )}
        </div>
      </section>

      <StatusExplainer order={order} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:col-span-2">
          <h2 className="border-b border-slate-800 px-6 py-5 text-lg font-semibold">Items</h2>
          <ul className="divide-y divide-slate-800">
            {order.orderItems.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                <BrandAvatar name={item.parfum?.brand?.name ?? ""} image={item.parfum?.brand?.image ?? null} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-100">
                    {item.parfum?.name ?? `Perfume #${item.parfumId}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.parfum?.brand?.name ? `${item.parfum.brand.name} · ` : ""}
                    {SELLING_TYPE_LABELS[item.sellingType]}
                  </p>
                </div>
                <div className="text-right text-sm tabular-nums">
                  <p className="text-slate-400">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                  <p className="font-semibold text-slate-100">{formatPrice(item.totalPrice)}</p>
                </div>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-slate-800 px-6 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Items</dt>
              <dd className="tabular-nums">{formatPrice(order.itemsTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Delivery</dt>
              <dd className="tabular-nums">{formatPrice(order.deliveryPrice ?? 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums text-amber-400">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        {/* Side: customer + timeline */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <UserRound size={18} className="text-amber-400" />
              Customer
            </h2>
            {order.customer ? (
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium text-slate-100">{order.customer.fullName}</p>
                <p className="flex items-center gap-2 text-slate-400">
                  <Phone size={14} className="shrink-0" /> {order.customer.phoneNumber}
                </p>
                <p className="flex items-center gap-2 text-slate-400">
                  <Mail size={14} className="shrink-0" /> {order.customer.email}
                </p>
                <p className="flex items-start gap-2 text-slate-400">
                  <MapPin size={14} className="mt-0.5 shrink-0" /> Deliver to: {order.deliveryAdress}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Customer #{order.customerId}</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock size={18} className="text-amber-400" />
              Status history
            </h2>
            <ol className="mt-4 space-y-4">
              <TimelineStep icon={<Clock size={14} />} done label="Created · stock reserved" at={order.pendingAt} by={order.userCreator} />
              {order.verifiedAt && (
                <TimelineStep icon={<CircleCheck size={14} />} done label="Confirmed · stock deducted" at={order.verifiedAt} by={order.userVerifier} />
              )}
              {order.delivredAt && <TimelineStep icon={<Truck size={14} />} done label="Delivered" at={order.delivredAt} />}
              {order.cancelledAt && (
                <TimelineStep
                  icon={<Ban size={14} />}
                  done
                  danger
                  label={order.verifiedAt ? "Cancelled · stock reversed" : "Cancelled · reservations released"}
                  at={order.cancelledAt}
                  by={order.userCanceller}
                />
              )}
              {order.status === "PENDING" && <TimelineStep icon={<CircleCheck size={14} />} label="Waiting for confirmation" />}
              {order.status === "COMFIRMED" && <TimelineStep icon={<Truck size={14} />} label="Waiting for delivery" />}
            </ol>
          </section>
        </div>
      </div>

      {/* Reservations */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Boxes size={18} className="text-amber-400" />
            Stock reservations
          </h2>
          <p className="mt-1 text-sm text-slate-400">Where each item&apos;s stock comes from. One item can use several sources.</p>
        </div>
        {reservations.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">No reservation recorded for this order.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 text-right font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Last change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reservations.map(({ reservation, item }) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-3 text-slate-300">
                      {item.parfum?.name ?? `Perfume #${item.parfumId}`}
                      <span className="block text-xs text-slate-500">{SELLING_TYPE_LABELS[item.sellingType]}</span>
                    </td>
                    <td className="px-6 py-3 text-slate-300">
                      {reservation.stockBatchId !== null ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Boxes size={14} className="text-slate-500" /> Batch #{reservation.stockBatchId}
                        </span>
                      ) : (
                        <Link href={`/dashboard/decants/${reservation.decantBottleId}`} className="inline-flex items-center gap-1.5 hover:text-amber-400">
                          <FlaskConical size={14} className="text-slate-500" /> Bottle #{reservation.decantBottleId}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-slate-100">
                      {reservation.stockBatchId !== null
                        ? `${reservation.quantity} bottle${reservation.quantity === 1 ? "" : "s"}`
                        : `${reservation.quantityMl} ml`}
                    </td>
                    <td className="px-6 py-3">
                      <ReservationBadge status={reservation.status} />
                      {reservation.status === "RELEASED" && reservation.consumedAt && (
                        <span className="ml-2 text-xs text-slate-500">(after consumption)</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {formatDateTime(reservation.releasedAt ?? reservation.consumedAt ?? reservation.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Decant operations */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <History size={18} className="text-amber-400" />
            Decant operations
          </h2>
          <Link href={`/dashboard/decants/operations?orderId=${order.id}`} className="text-sm text-slate-400 hover:text-amber-400">
            Open in history →
          </Link>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Created automatically when the order is confirmed (one per bottle used), and reversed if a confirmed order is cancelled.
        </p>

        {operations.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
            {order.status === "PENDING"
              ? "No decant poured yet: operations appear when the order is confirmed."
              : "This order has no decant operation."}
          </p>
        ) : (
          <ol className="mt-6">
            {operations.map((op) => (
              <li key={op.id} className="relative flex gap-4 pb-6 last:pb-0">
                <span className="absolute left-4 top-8 -ml-px h-[calc(100%-2rem)] w-px bg-slate-800 last:hidden" aria-hidden="true" />
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    op.oppType === "REVERSAL" ? "bg-sky-500/15 text-sky-400" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {op.oppType === "REVERSAL" ? <RotateCcw size={15} /> : <CircleMinus size={15} />}
                </span>
                <div className="pt-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <OperationBadge type={op.oppType} />
                    <span className="font-medium text-slate-100">
                      {op.oppType === "REVERSAL" ? "+" : "−"}
                      {op.quantityMl} ml
                    </span>
                    <Link href={`/dashboard/decants/${op.decantBottleId}`} className="text-slate-400 hover:text-amber-400">
                      bottle #{op.decantBottleId}
                    </Link>
                    {op.reversedOperationId && <span className="text-xs text-slate-500">reverses operation #{op.reversedOperationId}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Operation #{op.id} · {formatDateTime(op.performedAt)} · {userName(op.employee)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {pendingAction && (
        <OrderActionDialog
          action={pendingAction}
          orderId={order.id}
          status={order.status}
          busy={busy}
          onClose={() => setPendingAction(null)}
          onConfirm={runAction}
        />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400">
      <ArrowLeft size={17} />
      Back to Orders
    </Link>
  );
}

function StatusExplainer({ order }: { order: OrderDetail }) {
  const text: Record<OrderDetail["status"], string> = {
    PENDING: "The stock below is reserved for this order: nobody else can sell it, but it hasn't left your inventory yet. Confirm to deduct it.",
    COMFIRMED: "The stock has been deducted from your inventory. Delivering won't deduct it again.",
    DELIVERD: "Delivered. The stock was deducted once, when the order was confirmed.",
    CANCELLED: order.verifiedAt
      ? "Cancelled after confirmation: the used stock was put back and each consumption has a matching reversal."
      : "Cancelled before confirmation: the reservations were released and nothing left the inventory.",
  };

  return (
    <p className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
      <Info size={16} className="mt-0.5 shrink-0 text-sky-400" />
      {text[order.status]}
    </p>
  );
}

function TimelineStep({
  icon,
  label,
  at,
  by,
  done = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  at?: string;
  by?: Parameters<typeof userName>[0];
  done?: boolean;
  danger?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          !done ? "border border-dashed border-slate-700 text-slate-600" : danger ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
        }`}
      >
        {icon}
      </span>
      <div className="text-sm">
        <p className={done ? "text-slate-200" : "text-slate-500"}>{label}</p>
        {at && (
          <p className="text-xs text-slate-500">
            {formatDateTime(at)}
            {by ? ` · ${userName(by)}` : ""}
          </p>
        )}
      </div>
    </li>
  );
}
