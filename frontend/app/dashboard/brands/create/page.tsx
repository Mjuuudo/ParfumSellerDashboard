"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { ArrowLeft, Tags } from "lucide-react";
import BrandForm from "../_components/BrandForm";
import { useRouter } from "next/navigation"

export default function CreateBrandPage() {

  const router =  useRouter();


  async function handleCreateBrand(event: FormEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page on submit. Keep this line.
    event.preventDefault();

    // TODO(you): read "name" and "image" with new FormData(event.currentTarget),
    // send them to the backend, handle errors (409 = name already exists),
    // then router.push("/dashboard/brands") on success.

    const formData = new FormData(event.currentTarget);
    
    const name = formData.get("name");


    const sendedObject = {
      name: name
    }

    const data = await fetch("http://localhost:8000/api/brand", {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sendedObject),
    });

    if (!data.ok) {
      alert(`Problem While Creating The Brand ${data.status}!`)
      return ;
    }

    router.replace('/dashboard/brands')
    return ;
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
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <Tags size={27} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Add Brand</h1>
        <p className="mt-2 text-sm text-slate-400">
          Add a new perfume house to your catalog.
        </p>
      </section>

      <BrandForm mode="create" onSubmit={handleCreateBrand} />
    </div>
  );
}
