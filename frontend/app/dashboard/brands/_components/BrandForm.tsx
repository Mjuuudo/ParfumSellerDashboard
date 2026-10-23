import Link from "next/link";
import type { FormEvent } from "react";
import { ImageIcon, Save, Tag, Plus } from "lucide-react";
import type { Brand } from "./brand";
import BrandAvatar from "./BrandAvatar";

type BrandFormProps = {
  mode: "create" | "edit";
  // The brand being edited. Leave it out on the create page.
  brand?: Brand;
  // Your submit handler. Read the values with new FormData(event.currentTarget):
  // "name", "image" and (edit mode only) "isActive" ("true" / "false").
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// Shared form UI for /dashboard/brands/create and /dashboard/brands/[id]/edit.
// It only lays out the fields; the page that uses it owns the logic.
export default function BrandForm({ mode, brand, onSubmit }: BrandFormProps) {
  const isEdit = mode === "edit";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Brand details */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <h2 className="text-xl font-semibold">Brand Details</h2>
          <p className="mt-1 text-sm text-slate-400">
            The name customers know the brand by, and its logo.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Logo preview */}
          <div className="flex flex-col items-center gap-2">
            <BrandAvatar name={brand?.name ?? ""} image={brand?.image ?? null} size="lg" />
            {/* TODO(you): to preview the URL while typing, keep the image input's value in state. */}
            <span className="text-xs text-slate-500">Preview</span>
          </div>

          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-300">
                Brand name <span className="text-amber-400">*</span>
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400">
                <Tag size={18} className="text-slate-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={brand?.name ?? ""}
                  placeholder="e.g. Maison Francis Kurkdjian"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>
              <p className="text-xs text-slate-500">Must be unique across your catalog.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium text-slate-300">
                Logo URL <span className="text-slate-500">(optional)</span>
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-amber-400">
                <ImageIcon size={18} className="text-slate-500" />
                <input
                  id="image"
                  name="image"
                  type="url"
                  defaultValue={brand?.image ?? ""}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>
              <p className="text-xs text-slate-500">
                Leave empty to show a perfume bottle placeholder instead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status: only when editing, new brands are active by default (isActive @default(true)) */}
      {isEdit && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-800 pb-5">
            <h2 className="text-xl font-semibold">Visibility</h2>
            <p className="mt-1 text-sm text-slate-400">
              Inactive brands are hidden from the catalog but keep their perfumes.
            </p>
          </div>

          <div className="max-w-xs space-y-2">
            <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
              Status
            </label>
            <select
              id="isActive"
              name="isActive"
              defaultValue={String(brand?.isActive ?? true)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/brands"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          {isEdit ? <Save size={17} /> : <Plus size={17} />}
          {isEdit ? "Save Changes" : "Add Brand"}
        </button>
      </div>
    </form>
  );
}
