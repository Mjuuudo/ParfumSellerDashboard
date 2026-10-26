"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import type { Brand } from "../../../brands/_components/brand";
import ParfumForm from "../../_components/ParfumForm";

export default function EditParfumPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  // TODO(you): fetch the perfume with this id AND the brands list in a useEffect,
  // then pass them as <ParfumForm parfum={...} brands={...} />.
  // Only render the form once BOTH have loaded: the fields use defaultValue, which is
  // read once when the form first appears, so data that arrives later won't show.
  // (Your users/[id]/edit page shows a loading message until its data is there — same idea.)
  const [brands, setBrands] = useState<Brand[]>([]);

  async function handleUpdateParfum(event: FormEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page on submit. Keep this line.
    event.preventDefault();

    // TODO(you): read the fields with new FormData(event.currentTarget), convert the
    // numbers and isActive ("true"/"false" → boolean), send only what changed,
    // handle errors, then go back to /dashboard/parfums.
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/dashboard/parfums"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
      >
        <ArrowLeft size={17} />
        Back to Perfumes
      </Link>

      <section>
        <p className="text-sm font-semibold tracking-widest text-amber-400">PERFUMES</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Perfume</h1>
        <p className="mt-2 text-sm text-slate-400">
          Update the details, prices and availability. Perfume ID: {id}
        </p>
      </section>

      <ParfumForm mode="edit" brands={brands} onSubmit={handleUpdateParfum} />
    </div>
  );
}
