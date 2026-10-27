"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  CircleAlert,
  CircleCheck,
  Info,
  Lock,
  MousePointerClick,
  PackageOpen,
  Cpu,
} from "lucide-react";
import PerfumeBottleOutline from "../../_components/PerfumeBottleOutline";
import { formatPrice } from "../../parfums/_components/parfum";
import { formatDate, unopenedInBatch } from "../_components/decantBottle";
import PrototypeNotice from "../_components/PrototypeNotice";
// ⚠ Prototype: replace with fetches of the real perfumes / batches / bottles.
import { mockBatches, mockBottles, mockParfums } from "../_mock/decantMocks";

type Step = "form" | "confirm" | "done";

export default function OpenBottlePage() {
  // ── What the user chooses ──
  const [parfumId, setParfumId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [reserveForMe, setReserveForMe] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [showErrors, setShowErrors] = useState(false);

  const activeParfums = mockParfums.filter((parfum) => parfum.isActive);
  const parfum = activeParfums.find((p) => String(p.id) === parfumId);
  const batches = mockBatches.filter((b) => String(b.parfumId) === parfumId);
  const batch = batches.find((b) => String(b.id) === batchId);
  const unopened = batch ? unopenedInBatch(batch, mockBottles) : 0;

  // ── Validation ──
  const errors: string[] = [];
  if (!parfum) errors.push("Select the perfume you want to open.");
  else if (batches.length === 0) errors.push("This perfume has no stock batch. Record a delivery first.");
  else if (!batch) errors.push("Select the batch the bottle comes from.");
  else if (unopened === 0) errors.push("Every bottle in this batch is already opened. Pick another batch.");
  const isValid = errors.length === 0;

  const handleReview = () => {
    setShowErrors(true);
    if (isValid) setStep("confirm");
  };

  const handleSelectParfum = (value: string) => {
    setParfumId(value);
    setBatchId(""); // batches belong to one perfume, so reset the batch choice
    setShowErrors(false);
  };

  if (step === "done" && parfum && batch) {
    return (
      <OpenedResult
        parfumName={parfum.name}
        brandName={parfum.brand?.name}
        volume={parfum.originalVolume}
        batchId={batch.id}
        parfumId={parfum.id}
        reserved={reserveForMe}
        onOpenAnother={() => {
          setStep("form");
          setParfumId("");
          setBatchId("");
          setReserveForMe(false);
          setShowErrors(false);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/dashboard/decants"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
      >
        <ArrowLeft size={17} />
        Back to Decant Bottles
      </Link>

      <PrototypeNotice>Choices work, but confirming doesn&apos;t save anything.</PrototypeNotice>

      <section>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <PackageOpen size={27} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Open Bottle for Decanting</h1>
        <p className="mt-2 text-sm text-slate-400">
          Take one sealed bottle out of a stock batch so you can sell 10 ml and 20 ml decants from it.
        </p>
      </section>

      {/* 1. User selections */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <SectionHeader
          number={1}
          title="Choose the bottle"
          badge={<SourceBadge kind="user" />}
          description="You pick which perfume, and from which delivery the bottle comes."
        />

        <div className="space-y-6">
          {/* Perfume */}
          <div className="space-y-2">
            <label htmlFor="parfumId" className="text-sm font-medium text-slate-300">
              Perfume <span className="text-amber-400">*</span>
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400">
              <PerfumeBottleOutline className="h-[18px] w-[18px] shrink-0 text-slate-500" />
              <select
                id="parfumId"
                value={parfumId}
                onChange={(event) => handleSelectParfum(event.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none [&>option]:bg-slate-900"
              >
                <option value="" disabled>
                  Select a perfume
                </option>
                {activeParfums.map((p) => {
                  const sealed = mockBatches
                    .filter((b) => b.parfumId === p.id)
                    .reduce((sum, b) => sum + unopenedInBatch(b, mockBottles), 0);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.brand?.name} · {p.name} · {p.originalVolume} ml ({sealed} sealed)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Batch */}
          {parfum && (
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium text-slate-300">
                Stock batch <span className="text-amber-400">*</span>
              </legend>

              {batches.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-700 px-4 py-5 text-center text-sm text-slate-400">
                  No delivery recorded for this perfume.{" "}
                  <Link href="/dashboard/stock/create" className="text-amber-400 hover:underline">
                    Record a delivery
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {batches.map((b) => {
                    const left = unopenedInBatch(b, mockBottles);
                    const disabled = left === 0;
                    return (
                      <label
                        key={b.id}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                          disabled
                            ? "cursor-not-allowed border-slate-800 bg-slate-950/50 opacity-60"
                            : "cursor-pointer border-slate-700 bg-slate-950 hover:border-slate-600 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-500/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name="stockBatchId"
                          value={b.id}
                          checked={batchId === String(b.id)}
                          disabled={disabled}
                          onChange={() => setBatchId(String(b.id))}
                          className="accent-amber-500"
                        />
                        <Boxes size={18} className="shrink-0 text-slate-500" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-slate-100">Batch #{b.id}</span>
                          <span className="block text-xs text-slate-500">
                            Received {formatDate(b.receivedAt)} · {formatPrice(b.purchaseCostPerBottle)} per bottle
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                            disabled ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                          }`}
                        >
                          {disabled ? "All opened" : `${left} of ${b.quantity} sealed`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          )}
        </div>
      </section>

      {/* 2. System values */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <SectionHeader
          number={2}
          title="Set automatically"
          badge={<SourceBadge kind="system" />}
          description="These come from the perfume and the batch. You can't type them."
        />

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SystemValue
            label="Original volume"
            source="from Perfume.originalVolume"
            value={parfum ? `${parfum.originalVolume} ml` : "—"}
          />
          <SystemValue
            label="Sealed bottles in batch"
            source="batch quantity − bottles already opened"
            value={batch ? `${unopened} → ${Math.max(unopened - 1, 0)} after opening` : "—"}
          />
          <SystemValue
            label="initialVolumeMl"
            source="= original volume"
            value={parfum ? `${parfum.originalVolume} ml` : "—"}
            mono
          />
          <SystemValue
            label="remainingVolumeMl"
            source="= initial volume (nothing poured yet)"
            value={parfum ? `${parfum.originalVolume} ml` : "—"}
            mono
          />
          <SystemValue label="createdAt" source="the moment you confirm" value="On confirmation" mono />
          <SystemValue label="isActive" source="new bottles start active" value="true" mono />
        </dl>

        <p className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <Info size={16} className="mt-0.5 shrink-0" />
          Opening a bottle doesn&apos;t use any perfume: it starts 100% full. Volume only goes down when a
          decant is sold.
        </p>
      </section>

      {/* 3. Reservation (open design question) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <SectionHeader
          number={3}
          title="Reservation"
          badge={
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300">
              Design option, not decided
            </span>
          }
          description="Optional. Fills reservedById and reservedAt with you and now."
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-slate-600 has-[:checked]:border-sky-500/60 has-[:checked]:bg-sky-500/10">
          <input
            type="checkbox"
            checked={reserveForMe}
            onChange={(event) => setReserveForMe(event.target.checked)}
            className="mt-0.5 accent-sky-500"
          />
          <span>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Lock size={15} className="text-sky-400" />
              Reserve this bottle for me
            </span>
            <span className="mt-1 block text-xs text-slate-400">
              What a reservation allows or blocks is still to be decided. Leave unchecked if unsure.
            </span>
          </span>
        </label>
      </section>

      {/* Validation */}
      {showErrors && !isValid && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-400" />
          <ul className="space-y-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/decants"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleReview}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <PackageOpen size={17} />
          Review &amp; Open
        </button>
      </div>

      {step === "confirm" && parfum && batch && (
        <ConfirmDialog
          onCancel={() => setStep("form")}
          onConfirm={() => setStep("done")}
          rows={[
            ["Perfume", `${parfum.brand?.name} · ${parfum.name}`],
            ["From batch", `#${batch.id} (received ${formatDate(batch.receivedAt)})`],
            ["Volume", `${parfum.originalVolume} ml, full`],
            ["Sealed left in batch", `${unopened} → ${unopened - 1}`],
            ["Reserved", reserveForMe ? "Yes, for you" : "No"],
          ]}
        />
      )}
    </div>
  );
}

function SectionHeader({
  number,
  title,
  badge,
  description,
}: {
  number: number;
  title: string;
  badge: React.ReactNode;
  description: string;
}) {
  return (
    <div className="mb-6 border-b border-slate-800 pb-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
          {number}
        </span>
        <h2 className="text-xl font-semibold">{title}</h2>
        {badge}
      </div>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

function SourceBadge({ kind }: { kind: "user" | "system" }) {
  return kind === "user" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
      <MousePointerClick size={12} />
      You choose
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
      <Cpu size={12} />
      Automatic
    </span>
  );
}

function SystemValue({ label, source, value, mono }: { label: string; source: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
      <dt className={`text-xs text-slate-400 ${mono ? "font-mono" : ""}`}>{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Lock size={13} className="shrink-0 text-slate-600" aria-label="Not editable" />
        {value}
      </dd>
      <dd className="mt-0.5 text-[11px] text-slate-600">{source}</dd>
    </div>
  );
}

function ConfirmDialog({
  rows,
  onCancel,
  onConfirm,
}: {
  rows: [string, string][];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Close with Escape, like the mobile navigation drawer.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-slate-950/80" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h2 id="confirm-title" className="text-lg font-semibold">
          Open this bottle?
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          One sealed bottle leaves the batch and becomes a decant bottle. This is recorded in your stock.
        </p>

        <dl className="mt-5 divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
              <dt className="text-slate-400">{label}</dt>
              <dd className="text-right font-medium text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            <PackageOpen size={16} />
            Confirm &amp; Open
          </button>
        </div>
      </div>
    </div>
  );
}

function OpenedResult({
  parfumName,
  brandName,
  volume,
  batchId,
  parfumId,
  reserved,
  onOpenAnother,
}: {
  parfumName: string;
  brandName?: string;
  volume: number;
  batchId: number;
  parfumId: number;
  reserved: boolean;
  onOpenAnother: () => void;
}) {
  // What the backend would receive (user choices only) vs. what it would store.
  const requestBody = { parfumId, stockBatchId: batchId, ...(reserved && { reserve: true }) };
  const storedRecord = {
    parfumId,
    stockBatchId: batchId,
    initialVolumeMl: volume,
    remainingVolumeMl: volume,
    reservedById: reserved ? "<your user id>" : null,
    reservedAt: reserved ? "<now>" : null,
    lastDecantedAt: null,
    isActive: true,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PrototypeNotice>Nothing was saved. This shows what the real request would send and store.</PrototypeNotice>

      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center sm:p-8">
        <CircleCheck size={40} className="mx-auto text-emerald-400" />
        <h1 className="mt-4 text-2xl font-bold">Bottle ready for decanting</h1>
        <p className="mt-2 text-sm text-slate-300">
          {brandName} · {parfumName}, {volume} ml full, from batch #{batchId}
          {reserved ? ", reserved for you" : ""}.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <SourceBadge kind="user" /> Request body
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
            {JSON.stringify(requestBody, null, 2)}
          </pre>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <SourceBadge kind="system" /> Stored DecantBottle
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
            {JSON.stringify(storedRecord, null, 2)}
          </pre>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onOpenAnother}
          className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Open another bottle
        </button>
        <Link
          href="/dashboard/decants"
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Back to Decant Bottles
        </Link>
      </div>
    </div>
  );
}
