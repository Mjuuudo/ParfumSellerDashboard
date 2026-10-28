"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CircleAlert,
  Info,
  Loader2,
  MapPin,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useToast } from "../../../_components/Toast";
import BrandAvatar from "../../brands/_components/BrandAvatar";
import { formatPrice } from "../../parfums/_components/parfum";
import type { Customer } from "../../customers/_components/customer";
import { LoadErrorCard, LoadingCard } from "../../_components/LoadStateCards";
import {
  API_BASE,
  DECANT_SIZE_ML,
  SELLING_TYPE_LABELS,
  maxUnits,
  readApiError,
  unitPriceOf,
  type PerfumeAvailability,
  type SellingType,
} from "../_components/order";

type Line = {
  key: number;
  parfumId: string; // "" until a perfume is picked
  sellingType: SellingType;
  quantity: string; // kept as text while typing
};

let nextLineKey = 1;
const newLine = (): Line => ({ key: nextLineKey++, parfumId: "", sellingType: "COMPLETE", quantity: "1" });

export default function CreateOrderPage() {
  const router = useRouter();
  const toast = useToast();

  // ── Data ──
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [perfumes, setPerfumes] = useState<PerfumeAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // ── Form ──
  const [customerId, setCustomerId] = useState("");
  const [deliveryAdress, setDeliveryAdress] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [lines, setLines] = useState<Line[]>(() => [newLine()]);
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, perfumesRes] = await Promise.all([
          fetch(`${API_BASE}/customer`, { credentials: "include" }),
          fetch(`${API_BASE}/order/availability`, { credentials: "include" }),
        ]);

        if (customersRes.status === 401 || perfumesRes.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (!customersRes.ok || !perfumesRes.ok) {
          toast.error("Error While Fetching Customers And Stock");
          setLoadError(true);
          return;
        }

        const allCustomers: Customer[] = await customersRes.json();
        setCustomers(allCustomers.filter((customer) => customer.isActive));
        setPerfumes(await perfumesRes.json());
      } catch {
        toast.error("Could not reach the server.");
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reloadKey, router, toast]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError(false);
    setReloadKey((key) => key + 1);
  };

  // ── Derived ──
  const perfumeById = new Map(perfumes.map((perfume) => [String(perfume.id), perfume]));
  const customer = customers.find((item) => String(item.id) === customerId);

  // Total demand per perfume across ALL lines: bottles for COMPLETE, ml for decants.
  const demand = new Map<string, { bottles: number; ml: number }>();
  for (const line of lines) {
    const quantity = Number(line.quantity);
    if (!line.parfumId || !Number.isInteger(quantity) || quantity < 1) continue;
    const entry = demand.get(line.parfumId) ?? { bottles: 0, ml: 0 };
    if (line.sellingType === "COMPLETE") entry.bottles += quantity;
    else entry.ml += quantity * DECANT_SIZE_ML[line.sellingType];
    demand.set(line.parfumId, entry);
  }

  const lineInfo = lines.map((line) => {
    const perfume = perfumeById.get(line.parfumId);
    const quantity = Number(line.quantity);
    const validQuantity = Number.isInteger(quantity) && quantity >= 1 && quantity <= 1000;
    const unitPrice = perfume ? unitPriceOf(line.sellingType, perfume) : 0;
    const lineTotal = validQuantity ? unitPrice * quantity : 0;

    let shortage = false;
    if (perfume && validQuantity) {
      const total = demand.get(line.parfumId)!;
      shortage = line.sellingType === "COMPLETE" ? total.bottles > perfume.availableBottles : total.ml > perfume.availableMl;
    }

    const problems: string[] = [];
    if (!perfume) problems.push("Pick a perfume.");
    if (!validQuantity) problems.push("Quantity must be a whole number between 1 and 1000.");
    return { line, perfume, validQuantity, unitPrice, lineTotal, shortage, problems };
  });

  const itemsTotal = lineInfo.reduce((sum, info) => sum + info.lineTotal, 0);
  const deliveryFee = deliveryPrice === "" ? 0 : Number(deliveryPrice);
  const deliveryValid = deliveryPrice === "" || (Number.isInteger(deliveryFee) && deliveryFee >= 0);
  const total = itemsTotal + (deliveryValid ? deliveryFee : 0);

  const formErrors: string[] = [];
  if (!customer) formErrors.push("Select the customer (or create one).");
  if (lines.length === 0) formErrors.push("Add at least one item.");
  lineInfo.forEach((info, index) => info.problems.forEach((problem) => formErrors.push(`Line ${index + 1}: ${problem}`)));
  if (!deliveryValid) formErrors.push("Delivery price must be a whole number of MAD (0 or more).");
  const hasShortage = lineInfo.some((info) => info.shortage);

  // ── Handlers ──
  const updateLine = (key: number, patch: Partial<Line>) => {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
    setServerErrors([]);
  };

  const removeLine = (key: number) => {
    setLines((current) => current.filter((line) => line.key !== key));
    setServerErrors([]);
  };

  const selectCustomer = (value: string) => {
    setCustomerId(value);
    const selected = customers.find((item) => String(item.id) === value);
    if (selected) setDeliveryAdress(selected.address);
  };

  const handleCustomerCreated = (created: Customer) => {
    setCustomers((current) => [created, ...current]);
    setCustomerId(String(created.id));
    setDeliveryAdress(created.address);
    setCreatingCustomer(false);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    setServerErrors([]);
    if (formErrors.length) return;

    const body = {
      customerId: Number(customerId),
      ...(deliveryAdress.trim() && { deliveryAdress: deliveryAdress.trim() }),
      ...(deliveryPrice !== "" && { deliveryPrice: deliveryFee }),
      items: lines.map((line) => ({
        parfumId: Number(line.parfumId),
        sellingType: line.sellingType,
        quantity: Number(line.quantity),
      })),
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/order`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push("/login");
        return;
      }
      if (!response.ok) {
        const messages = await readApiError(response, `Error While Creating The Order ${response.status}`);
        setServerErrors(messages);
        toast.error(
          response.status === 409 ? "Some lines can't be covered by the current stock. Nothing was reserved." : messages.join(" · "),
          response.status === 409 ? "Insufficient stock" : "Order not created",
        );
        if (response.status === 409) retryLoad(); // refresh the availability numbers
        return;
      }

      const order = await response.json();
      toast.success(`Order #${order.id} was created and its stock reserved.`, "Order created");
      router.push(`/dashboard/orders/${order.id}`);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
      >
        <ArrowLeft size={17} />
        Back to Orders
      </Link>

      <section>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <ShoppingCart size={27} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">New Order</h1>
        <p className="mt-2 text-sm text-slate-400">
          Saving the order reserves its stock right away. Nothing is deducted until the order is confirmed.
        </p>
      </section>

      {loadError ? (
        <LoadErrorCard what="customers and stock" onRetry={retryLoad} />
      ) : loading && perfumes.length === 0 ? (
        <LoadingCard label="Loading customers and stock..." />
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Customer */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <SectionTitle number={1} title="Customer" />

              {creatingCustomer ? (
                <QuickCustomerForm onCancel={() => setCreatingCustomer(false)} onCreated={handleCustomerCreated} />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400">
                      <UserRound size={18} className="shrink-0 text-slate-500" />
                      <select
                        aria-label="Customer"
                        value={customerId}
                        onChange={(event) => selectCustomer(event.target.value)}
                        className="w-full bg-transparent py-3 text-sm outline-none [&>option]:bg-slate-900"
                      >
                        <option value="" disabled>
                          {customers.length ? "Select a customer" : "No active customer yet"}
                        </option>
                        {customers.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.fullName} · {item.phoneNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreatingCustomer(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                      <UserPlus size={17} />
                      New customer
                    </button>
                  </div>

                  {customer && (
                    <p className="rounded-lg bg-slate-950 px-4 py-3 text-xs text-slate-400">
                      {customer.email} · {customer.phoneNumber}
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Items */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <SectionTitle number={2} title="Items" />

              <div className="space-y-4">
                {lineInfo.map((info, index) => (
                  <ItemLine
                    key={info.line.key}
                    index={index}
                    info={info}
                    perfumes={perfumes}
                    demand={demand.get(info.line.parfumId)}
                    showErrors={showErrors}
                    canRemove={lines.length > 1}
                    onChange={(patch) => updateLine(info.line.key, patch)}
                    onRemove={() => removeLine(info.line.key)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setLines((current) => [...current, newLine()])}
                disabled={lines.length >= 50}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-amber-500/50 hover:text-amber-300 disabled:opacity-50"
              >
                <Plus size={16} />
                Add item
              </button>
            </section>

            {/* Delivery */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <SectionTitle number={3} title="Delivery" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_200px]">
                <div className="space-y-2">
                  <label htmlFor="deliveryAdress" className="text-sm font-medium text-slate-300">
                    Delivery address
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400">
                    <MapPin size={18} className="shrink-0 text-slate-500" />
                    <input
                      id="deliveryAdress"
                      value={deliveryAdress}
                      onChange={(event) => setDeliveryAdress(event.target.value)}
                      maxLength={255}
                      placeholder="Defaults to the customer's address"
                      className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="deliveryPrice" className="text-sm font-medium text-slate-300">
                    Delivery fee <span className="text-slate-500">(MAD)</span>
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400">
                    <Truck size={18} className="shrink-0 text-slate-500" />
                    <input
                      id="deliveryPrice"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={deliveryPrice}
                      onChange={(event) => setDeliveryPrice(event.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                {lineInfo.map((info, index) => (
                  <div key={info.line.key} className="flex justify-between gap-3">
                    <dt className="truncate text-slate-400">
                      {info.validQuantity ? `${info.line.quantity} × ` : ""}
                      {info.perfume?.name ?? `Line ${index + 1}`}
                      <span className="text-slate-600"> · {shortType(info.line.sellingType)}</span>
                    </dt>
                    <dd className="shrink-0 tabular-nums text-slate-200">{formatPrice(info.lineTotal)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 border-t border-slate-800 pt-2">
                  <dt className="text-slate-400">Items</dt>
                  <dd className="tabular-nums">{formatPrice(itemsTotal)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Delivery</dt>
                  <dd className="tabular-nums">{formatPrice(deliveryValid ? deliveryFee : 0)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-800 pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums text-amber-400">{formatPrice(total)}</dd>
                </div>
              </dl>

              {hasShortage && (
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  Some lines ask for more than the stock shown. The server will refuse the order if it can&apos;t reserve everything.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? <Loader2 size={17} className="animate-spin" /> : <ShoppingCart size={17} />}
                {submitting ? "Reserving stock..." : "Create order & reserve stock"}
              </button>
              <Link
                href="/dashboard/orders"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </Link>
            </section>

            {showErrors && formErrors.length > 0 && <ErrorList title="Check the form" messages={formErrors} />}
            {serverErrors.length > 0 && <ErrorList title="The server refused the order" messages={serverErrors} />}
          </aside>
        </form>
      )}
    </div>
  );
}

function shortType(type: SellingType) {
  return type === "COMPLETE" ? "bottle" : type === "DECANT_10ML" ? "10 ml" : "20 ml";
}

function SectionTitle({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-800 pb-4">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">{number}</span>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function ErrorList({ title, messages }: { title: string; messages: string[] }) {
  return (
    <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <p className="flex items-center gap-2 font-semibold">
        <CircleAlert size={16} className="shrink-0 text-red-400" />
        {title}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

function ItemLine({
  index,
  info,
  perfumes,
  demand,
  showErrors,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  info: {
    line: Line;
    perfume: PerfumeAvailability | undefined;
    validQuantity: boolean;
    unitPrice: number;
    lineTotal: number;
    shortage: boolean;
    problems: string[];
  };
  perfumes: PerfumeAvailability[];
  demand: { bottles: number; ml: number } | undefined;
  showErrors: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<Line>) => void;
  onRemove: () => void;
}) {
  const { line, perfume } = info;
  const invalid = showErrors && info.problems.length > 0;

  return (
    <div
      className={`rounded-xl border bg-slate-950 p-4 ${
        invalid ? "border-red-500/50" : info.shortage ? "border-amber-500/50" : "border-slate-800"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {perfume ? (
            <BrandAvatar name={perfume.brand?.name ?? ""} image={perfume.brand?.image ?? null} size="sm" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-400">{index + 1}</span>
          )}
          <p className="truncate text-sm font-medium text-slate-200">
            {perfume ? `${perfume.brand?.name ? `${perfume.brand.name} · ` : ""}${perfume.name}` : `Item ${index + 1}`}
          </p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove item ${index + 1}`}
            title="Remove"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_110px]">
        <select
          aria-label={`Perfume of item ${index + 1}`}
          value={line.parfumId}
          onChange={(event) => onChange({ parfumId: event.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-amber-400 [&>option]:bg-slate-900"
        >
          <option value="" disabled>
            Select a perfume
          </option>
          {perfumes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.brand?.name ? `${item.brand.name} · ` : ""}
              {item.name} · {item.originalVolume} ml
            </option>
          ))}
        </select>

        <select
          aria-label={`Selling type of item ${index + 1}`}
          value={line.sellingType}
          onChange={(event) => onChange({ sellingType: event.target.value as SellingType })}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-amber-400 [&>option]:bg-slate-900"
        >
          {(Object.keys(SELLING_TYPE_LABELS) as SellingType[]).map((type) => (
            <option key={type} value={type}>
              {SELLING_TYPE_LABELS[type]}
              {perfume ? ` (${maxUnits(type, perfume)} avail.)` : ""}
            </option>
          ))}
        </select>

        <input
          aria-label={`Quantity of item ${index + 1}`}
          type="number"
          min={1}
          max={1000}
          step={1}
          inputMode="numeric"
          value={line.quantity}
          onChange={(event) => onChange({ quantity: event.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-amber-400"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className={info.shortage ? "text-amber-300" : "text-slate-500"}>
          {perfume ? availabilityText(line.sellingType, perfume, demand) : "Pick a perfume to see its stock."}
        </span>
        <span className="tabular-nums text-slate-400">
          {perfume ? `${formatPrice(info.unitPrice)} each` : "—"}
          <span className="mx-2 text-slate-700">|</span>
          <span className="font-semibold text-slate-100">{formatPrice(info.lineTotal)}</span>
        </span>
      </div>

      {invalid && (
        <p className="mt-2 text-xs text-red-300">{info.problems.join(" ")}</p>
      )}
    </div>
  );
}

function availabilityText(type: SellingType, perfume: PerfumeAvailability, demand: { bottles: number; ml: number } | undefined) {
  if (type === "COMPLETE") {
    const asked = demand?.bottles ?? 0;
    return `${perfume.availableBottles} sealed bottle${perfume.availableBottles === 1 ? "" : "s"} available` +
      (asked > perfume.availableBottles ? ` · this order asks for ${asked}` : "");
  }
  const asked = demand?.ml ?? 0;
  const base = `${perfume.availableMl} ml available in ${perfume.openBottles} open bottle${perfume.openBottles === 1 ? "" : "s"}`;
  return asked > perfume.availableMl ? `${base} · this order asks for ${asked} ml` : base;
}

// Inline "new customer" form: POST /api/customer, then the new customer is selected.
function QuickCustomerForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (customer: Customer) => void }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // Not a <form>: it sits inside the order form, and nested forms aren't valid HTML.
  const handleCreate = async (container: HTMLElement) => {
    const read = (name: string) => (container.querySelector(`[name="${name}"]`) as HTMLInputElement | null)?.value.trim() ?? "";
    const body = { fullName: read("fullName"), email: read("email"), phoneNumber: read("phoneNumber"), address: read("address") };

    if (!body.fullName || !body.email || !body.phoneNumber || !body.address) {
      toast.error("Fill in the name, phone, email and address.", "Customer not created");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/customer`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        toast.error((await readApiError(response, `Error While Creating The Customer ${response.status}`)).join(" · "), "Customer not created");
        return;
      }
      const created: Customer = await response.json();
      toast.success(`${created.fullName} was added and selected.`, "Customer created");
      onCreated(created);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-950 p-4" id="quick-customer">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">New customer</p>
        <button type="button" onClick={onCancel} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { name: "fullName", placeholder: "Full name", type: "text" },
          { name: "phoneNumber", placeholder: "Phone number", type: "tel" },
          { name: "email", placeholder: "Email", type: "email" },
          { name: "address", placeholder: "Delivery address", type: "text" },
        ].map((field) => (
          <input
            key={field.name}
            name={field.name}
            type={field.type}
            aria-label={field.placeholder}
            placeholder={field.placeholder}
            onKeyDown={(event) => {
              // Enter would submit the surrounding ORDER form.
              if (event.key === "Enter") event.preventDefault();
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-amber-400"
          />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={(event) => handleCreate(event.currentTarget.closest("#quick-customer") as HTMLElement)}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-70"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          Save customer
        </button>
      </div>
    </div>
  );
}
