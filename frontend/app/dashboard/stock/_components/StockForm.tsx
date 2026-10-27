import Link from "next/link";
import type { FormEvent } from "react";
import { CalendarDays, Hash, Coins, PackagePlus, Info, Save, TriangleAlert } from "lucide-react";
import { CURRENCY, type Parfum } from "../../parfums/_components/parfum";
import PerfumeBottleOutline from "../../_components/PerfumeBottleOutline";
import type { StockBatch } from "./stockBatch";

type StockFormProps = {
  mode: "create" | "edit";
  // The batch being edited. Leave it out on the create page.
  batch?: StockBatch;
  // Options for the perfume dropdown. Your page fetches them and passes them in.
  parfums: Parfum[];
  // Your submit handler. Read the values with new FormData(event.currentTarget):
  // "parfumId", "quantity", "purchaseCostPerBottle" and "receivedAt" ("" or "2026-10-26").
  // Every FormData value is a STRING, convert before sending.
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const inputClass =
  "w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600";
const fieldBoxClass =
  "flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400";

// Shared form UI for /dashboard/stock/create and /dashboard/stock/[id]/edit.
// It only lays out the fields; the page that uses it owns the logic.
export default function StockForm({ mode, batch, parfums, onSubmit }: StockFormProps) {
  const isEdit = mode === "edit";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Editing a delivery changes stock history, so say it clearly */}
      {isEdit && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <p>
            Only correct mistakes here (wrong count, wrong price). Bottles from this batch may
            already be opened for decants, so lowering the quantity can make your stock inconsistent.
          </p>
        </div>
      )}

      {/* What arrived */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <h2 className="text-xl font-semibold">Delivery</h2>
          <p className="mt-1 text-sm text-slate-400">
            Which perfume arrived, how many full bottles, and when.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="parfumId" className="text-sm font-medium text-slate-300">
              Perfume <span className="text-amber-400">*</span>
            </label>
            <div className={fieldBoxClass}>
              <PerfumeBottleOutline className="h-[18px] w-[18px] shrink-0 text-slate-500" />
              <select
                id="parfumId"
                name="parfumId"
                required
                defaultValue={batch ? String(batch.parfumId) : ""}
                className="w-full bg-transparent py-3 text-sm outline-none [&>option]:bg-slate-900"
              >
                <option value="" disabled>
                  {parfums.length === 0 ? "No perfumes loaded" : "Select a perfume"}
                </option>
                {parfums.map((parfum) => (
                  <option key={parfum.id} value={parfum.id}>
                    {parfum.brand ? `${parfum.brand.name} · ` : ""}
                    {parfum.name} · {parfum.originalVolume} ml
                  </option>
                ))}
              </select>
            </div>
            {/* TODO(you): the list is empty until your page fetches the perfumes (active ones only?). */}
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium text-slate-300">
              Bottles received <span className="text-amber-400">*</span>
            </label>
            <div className={fieldBoxClass}>
              <Hash size={18} className="shrink-0 text-slate-500" />
              <input
                id="quantity"
                name="quantity"
                type="number"
                inputMode="numeric"
                required
                min={1}
                step={1}
                defaultValue={batch?.quantity ?? ""}
                placeholder="12"
                className={inputClass}
              />
              <span className="text-sm text-slate-500">bottles</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="receivedAt" className="text-sm font-medium text-slate-300">
              Received on <span className="text-slate-500">(optional)</span>
            </label>
            <div className={fieldBoxClass}>
              <CalendarDays size={18} className="shrink-0 text-slate-500" />
              <input
                id="receivedAt"
                name="receivedAt"
                type="date"
                // "2026-10-26T14:03:00.000Z" → "2026-10-26", the format a date input expects.
                defaultValue={batch ? batch.receivedAt.slice(0, 10) : ""}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
            <p className="text-xs text-slate-500">
              {isEdit ? "The date this delivery arrived." : "Leave empty if it arrived today."}
            </p>
          </div>
        </div>
      </section>

      {/* Cost */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <h2 className="text-xl font-semibold">Purchase Cost</h2>
          <p className="mt-1 text-sm text-slate-400">
            What you paid the supplier, per bottle. Used later to calculate your margins.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="purchaseCostPerBottle" className="text-sm font-medium text-slate-300">
              Cost per bottle <span className="text-amber-400">*</span>
            </label>
            <div className={fieldBoxClass}>
              <Coins size={18} className="shrink-0 text-slate-500" />
              <input
                id="purchaseCostPerBottle"
                name="purchaseCostPerBottle"
                type="number"
                inputMode="numeric"
                required
                min={1}
                step={1}
                defaultValue={batch?.purchaseCostPerBottle ?? ""}
                placeholder="0"
                className={inputClass}
              />
              <span className="text-sm text-slate-500">{CURRENCY}</span>
            </div>
          </div>

          {/* Total preview */}
          <div className="flex flex-col justify-end">
            <div className="rounded-lg border border-dashed border-slate-700 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total for this delivery</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-amber-400">
                {/* TODO(you, optional): keep quantity and cost in state (onChange) to show quantity × cost here live. */}
                — {CURRENCY}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 flex items-start gap-2 text-xs text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0" />
          {isEdit
            ? "The person who received this delivery stays the same."
            : "The delivery is recorded under your account automatically."}
        </p>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/stock"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          {isEdit ? <Save size={17} /> : <PackagePlus size={17} />}
          {isEdit ? "Save Changes" : "Record Delivery"}
        </button>
      </div>
    </form>
  );
}
