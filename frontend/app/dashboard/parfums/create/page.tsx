"use client";

import Link from "next/link";
import { useState, type FormEvent, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Brand } from "../../brands/_components/brand";
import ParfumForm from "../_components/ParfumForm";
import PerfumeBottleOutline from "../../_components/PerfumeBottleOutline";
import { useRouter } from "next/navigation"


export default function CreateParfumPage() {

  // TODO(you): fetch the brands in a useEffect and store them here so the
  // brand dropdown has options (maybe only the active ones?).
  const [brands, setBrands] = useState<Brand[]>([]);
  const router =  useRouter();
  useEffect(() => {
    const fetchBrands = async () => {
      const data = await fetch("http://localhost:8000/api/brand", {
        method: "get",
        credentials: "include",
      });

      if (data.status === 401){
        router.push('/login');
        return ;
      }
      if (!data.ok) {
        alert(`Error Occured ! ${data.status}`);
        return ;
      }

      const result = await data.json();
      setBrands(result);
    }

    fetchBrands();
  }, [])


  async function handleCreateParfum(event: FormEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page on submit. Keep this line.
    event.preventDefault();

    // TODO(you): read the fields with new FormData(event.currentTarget).
    // They are all strings: convert brandId, originalVolume and the three prices
    // to numbers (your DTO uses @IsInt). Send them, handle errors
    // (409 = same brand + name + size already exists), then go back to /dashboard/parfums.
    const formData = new FormData(event.currentTarget);
    const newObject = {
      name: formData.get("name"),
      brandId: Number(formData.get("brandId")),
      originalVolume: Number(formData.get("originalVolume")),
      completePrice: Number(formData.get("completePrice")),
      decant10Price: Number(formData.get("decant10Price")),
      decant20Price: Number(formData.get("decant20Price")),
    };

    const data = await fetch(`http://localhost:8000/api/parfum`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newObject)
    });

    if (!data.ok){
      alert("Error While Creating The Parfum");
      return ;
    }

    router.push('/dashboard/parfums')
    return 

  
  
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
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <PerfumeBottleOutline className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Add Perfume</h1>
        <p className="mt-2 text-sm text-slate-400">
          Add a perfume to your catalog with its bottle size and selling prices.
        </p>
      </section>

      <ParfumForm mode="create" brands={brands} onSubmit={handleCreateParfum} />
    </div>
  );
}
