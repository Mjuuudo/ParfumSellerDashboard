"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import BrandForm from "../../_components/BrandForm";

export default function EditBrandPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  // TODO(you): fetch the brand with this id in a useEffect, keep it in state, and
  // pass it to <BrandForm brand={...} /> so the fields are pre-filled.
  // Until it has loaded, show a loading message (see users/[id]/edit/page.tsx).

  async function handleUpdateBrand(event: FormEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page on submit. Keep this line.
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const updatedObject = {
      ...(formData.get("name") !== "" && {
        name: formData.get("name")
      }),
      ...(formData.get("isActive") === "true" && {
        isActive: true
      }),
      ...(formData.get("isActive") === "false" && {
        isActive: false
      }),
    };

    // TODO(you): read the fields with new FormData(event.currentTarget), send only
    // what changed to the backend, handle errors, then go back to /dashboard/brands.
    const data = await fetch(`http://localhost:8000/api/brand/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedObject),
    })

    console.log(updatedObject);
    if (!data.ok) {
      alert (`AN Error Occured While Modifying Data ${data.status}`);
      return
    }
    
    router.push("/dashboard/brands");
    return 
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/dashboard/brands"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
      >
        <ArrowLeft size={17} />
        Back to Brands
      </Link>

      <section>
        <p className="text-sm font-semibold tracking-widest text-amber-400">BRANDS</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Brand</h1>
        <p className="mt-2 text-sm text-slate-400">
          Update the brand&apos;s details and visibility. Brand ID: {id}
        </p>
      </section>

      <BrandForm mode="edit" onSubmit={handleUpdateBrand} />
    </div>
  );
}
