import Link from "next/link";
import type { FormEvent } from "react";
import { Save, Plus, CircleCheck, CircleOff, Tags, Droplets } from "lucide-react";
import type { Brand } from "../../brands/_components/brand";
import { CURRENCY, type Parfum } from "./parfum";
import PerfumeBottleOutline from "../../_components/PerfumeBottleOutline";

type ParfumFormProps = {
  mode: "create" | "edit";
  // The perfume being edited. Leave it out on the create page.
  parfum?: Parfum;
  // Options for the brand dropdown. Your page fetches them and passes them in.
  brands: Brand[];
  // Your submit handler. Read the values with new FormData(event.currentTarget):
  // "name", "brandId", "originalVolume", "completePrice", "decant10Price", "decant20Price"
  // and (edit mode only) "isActive".
  // Every FormData value is a STRING (e.g. "100", "true"), convert before sending.
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// Standard bottle sizes offered in the form (ml).
export const BOTTLE_SIZES = [50, 75, 100, 120, 150, 200];

// When editing a perfume saved with a size that isn't in the list (e.g. 90 ml),
// add it so the current value can still be shown and kept.
function sizeOptions(current?: number) {
  if (current === undefined || BOTTLE_SIZES.includes(current)) return BOTTLE_SIZES;
  return [...BOTTLE_SIZES, current].sort((a, b) => a - b);
}

const inputClass =
  "w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600";
const fieldBoxClass =
  "flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400";

// Shared form UI for /dashboard/parfums/create and /dashboard/parfums/[id]/edit.
// It only lays out the fields; the page that uses it owns the logic.
export default function ParfumForm({ mode, parfum, brands, onSubmit }: ParfumFormProps) {
  const isEdit = mode === "edit";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Identity */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <h2 className="text-xl font-semibold">Perfume Details</h2>
          <p className="mt-1 text-sm text-slate-400">
            The name, brand and bottle size. The same name can exist in several sizes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-300">
              Perfume name <span className="text-amber-400">*</span>
            </label>
            <div className={fieldBoxClass}>
              <PerfumeBottleOutline className="h-[18px] w-[18px] shrink-0 text-slate-500" />
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={parfum?.name ?? ""}
                placeholder="e.g. Sauvage Eau de Parfum"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="brandId" className="text-sm font-medium text-slate-300">
              Brand <span className="text-amber-400">*</span>
            </label>
            <div className={fieldBoxClass}>
              <Tags size={18} className="shrink-0 text-slate-500" />
              <select
                id="brandId"
                name="brandId"
                required
                defaultValue={parfum ? String(parfum.brandId) : ""}
                className="w-full bg-transparent py-3 text-sm outline-none [&>option]:bg-slate-900"
              >
                <option value="" disabled>
                  {brands.length === 0 ? "No brands loaded" : "Select a brand"}
                </option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                    {brand.isActive ? "" : " (inactive)"}
                  </option>
                ))}
              </select>
            </div>
            {/* TODO(you): the list is empty until your page fetches the brands and passes them in. */}
          </div>

          {/* Bottle size: radio "chips" sharing name="originalVolume". FormData gives the
              chosen size as a string ("100"), same as the old number input did. */}
          <fieldset className="space-y-2 sm:col-span-2">
            <legend className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Droplets size={16} className="text-slate-500" />
              Bottle size <span className="text-amber-400">*</span>
            </legend>

            <div className="grid grid-cols-3 gap-2 pt-1 sm:grid-cols-6">
              {sizeOptions(parfum?.originalVolume).map((size, index) => (
                <label
                  key={size}
                  className="cursor-pointer rounded-lg border border-slate-700 bg-slate-950 py-3 text-center text-sm font-medium text-slate-300 transition hover:border-slate-600 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-400/40"
                >
                  <input
                    type="radio"
                    name="originalVolume"
                    value={size}
                    // `required` on one radio makes the whole group required.
                    required={index === 0}
                    defaultChecked={parfum?.originalVolume === size}
                    className="sr-only"
                  />
                  {size} ml
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {/* Prices */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <h2 className="text-xl font-semibold">Prices</h2>
          <p className="mt-1 text-sm text-slate-400">
            Selling prices in {CURRENCY}, whole numbers only.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { id: "completePrice", label: "Full bottle", value: parfum?.completePrice },
            { id: "decant10Price", label: "Decant 10 ml", value: parfum?.decant10Price },
            { id: "decant20Price", label: "Decant 20 ml", value: parfum?.decant20Price },
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-medium text-slate-300">
                {field.label} <span className="text-amber-400">*</span>
              </label>
              <div className={fieldBoxClass}>
                <input
                  id={field.id}
                  name={field.id}
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  step={1}
                  defaultValue={field.value ?? ""}
                  placeholder="0"
                  className={inputClass}
                />
                <span className="text-sm text-slate-500">{CURRENCY}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Status: only when editing, new perfumes are active by default (isActive @default(true)) */}
      {isEdit && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-800 pb-5">
            <h2 className="text-xl font-semibold">Availability</h2>
            <p className="mt-1 text-sm text-slate-400">
              Inactive perfumes can&apos;t be sold but keep their stock and order history.
            </p>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-300">Status</legend>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-slate-600 has-[:checked]:border-emerald-500/60 has-[:checked]:bg-emerald-500/10">
                <input
                  type="radio"
                  name="isActive"
                  value="true"
                  defaultChecked={parfum?.isActive ?? true}
                  className="mt-0.5 accent-emerald-500"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <CircleCheck size={16} />
                    Active
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    Available for sale as a full bottle or decant.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-slate-600 has-[:checked]:border-red-500/60 has-[:checked]:bg-red-500/10">
                <input
                  type="radio"
                  name="isActive"
                  value="false"
                  defaultChecked={parfum ? !parfum.isActive : false}
                  className="mt-0.5 accent-red-500"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-red-400">
                    <CircleOff size={16} />
                    Inactive
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    Hidden from sales. Stock and history are kept.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/parfums"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          {isEdit ? <Save size={17} /> : <Plus size={17} />}
          {isEdit ? "Save Changes" : "Add Perfume"}
        </button>
      </div>
    </form>
  );
}
