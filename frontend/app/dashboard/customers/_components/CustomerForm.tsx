import Link from "next/link";
import type { FormEvent } from "react";
import { AtSign, CircleCheck, CircleOff, Loader2, MapPin, Phone, Plus, Save, UserRound } from "lucide-react";
import type { Customer } from "./customer";

type CustomerFormProps = {
  mode: "create" | "edit";
  // The customer being edited. Leave it out on the create page.
  customer?: Customer;
  // true while the request runs: the submit button shows a spinner and is disabled.
  submitting?: boolean;
  // Fields: "fullName", "email", "phoneNumber", "address" and (edit mode only) "isActive" ("true" / "false").
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// Shared form for /dashboard/customers/create and /dashboard/customers/[id]/edit.
export default function CustomerForm({ mode, customer, submitting = false, onSubmit }: CustomerFormProps) {
  const isEdit = mode === "edit";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <h2 className="text-xl font-semibold">Customer Details</h2>
          <p className="mt-1 text-sm text-slate-400">How to reach the customer and where to deliver their orders.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            id="fullName"
            label="Full name"
            icon={<UserRound size={18} className="text-slate-500" />}
            defaultValue={customer?.fullName}
            placeholder="e.g. Sara Benali"
            autoComplete="name"
            maxLength={120}
            className="sm:col-span-2"
          />
          <Field
            id="phoneNumber"
            label="Phone number"
            type="tel"
            icon={<Phone size={18} className="text-slate-500" />}
            defaultValue={customer?.phoneNumber}
            placeholder="+212 6..."
            autoComplete="tel"
            maxLength={30}
            hint="Must be unique: two customers can't share a number."
          />
          <Field
            id="email"
            label="Email address"
            type="email"
            icon={<AtSign size={18} className="text-slate-500" />}
            defaultValue={customer?.email}
            placeholder="name@example.com"
            autoComplete="email"
            hint="Must be unique as well."
          />
          <Field
            id="address"
            label="Delivery address"
            icon={<MapPin size={18} className="text-slate-500" />}
            defaultValue={customer?.address}
            placeholder="Street, district, city"
            autoComplete="street-address"
            maxLength={255}
            className="sm:col-span-2"
          />
        </div>
      </section>

      {/* Status: only when editing; new customers are active by default (isActive @default(true)) */}
      {isEdit && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-800 pb-5">
            <h2 className="text-xl font-semibold">Status</h2>
            <p className="mt-1 text-sm text-slate-400">
              Inactive customers stay in your records with their past orders, but aren&apos;t offered for new orders.
            </p>
          </div>

          <fieldset>
            <legend className="sr-only">Status</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-slate-600 has-[:checked]:border-emerald-500/60 has-[:checked]:bg-emerald-500/10">
                <input
                  type="radio"
                  name="isActive"
                  value="true"
                  defaultChecked={customer?.isActive ?? true}
                  className="mt-0.5 accent-emerald-500"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <CircleCheck size={16} />
                    Active
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">Can be selected for new orders.</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-slate-600 has-[:checked]:border-red-500/60 has-[:checked]:bg-red-500/10">
                <input
                  type="radio"
                  name="isActive"
                  value="false"
                  defaultChecked={customer ? !customer.isActive : false}
                  className="mt-0.5 accent-red-500"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-red-400">
                    <CircleOff size={16} />
                    Inactive
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">Kept for history, hidden from new orders.</span>
                </span>
              </label>
            </div>
          </fieldset>
        </section>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? (
            <Loader2 size={17} className="animate-spin" />
          ) : isEdit ? (
            <Save size={17} />
          ) : (
            <Plus size={17} />
          )}
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Customer"}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  icon,
  type = "text",
  defaultValue,
  placeholder,
  autoComplete,
  maxLength,
  hint,
  className = "",
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  type?: string;
  defaultValue?: string;
  placeholder: string;
  autoComplete?: string;
  maxLength?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label} <span className="text-amber-400">*</span>
      </label>
      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400">
        {icon}
        <input
          id={id}
          name={id}
          type={type}
          required
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
        />
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
