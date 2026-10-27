"use client";

import Link from "next/link";
import { useState, type FormEvent, useEffect } from "react";
import { ArrowLeft, PackagePlus } from "lucide-react";
import type { Parfum } from "../../parfums/_components/parfum";
import StockForm from "../_components/StockForm";
import { useRouter } from "next/navigation"

export default function RecordDeliveryPage() {

  // TODO(you): fetch the perfumes in a useEffect and store them here so the
  // perfume dropdown has options (only the active ones?).
  const [parfums, setParfums] = useState<Parfum[]>([]);
  const router = useRouter();

  useEffect( () => {
    const  fetchData = async () => {
      const data = await fetch(`http://localhost:8000/api/parfum`, {
        method: "get",
        credentials: "include"
      })

      if (data.status === 401) {
        router.push('/login');
        return ;
      }

      if (!data.ok) {
        alert(`Error While Fetching Data !`);
        return ;
      }

      setParfums( await data.json() );
    }


    fetchData();
  }, [])


  async function handleRecordDelivery(event: FormEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page on submit. Keep this line.
    event.preventDefault();

    // TODO(you): read the fields with new FormData(event.currentTarget).
    // parfumId, quantity and purchaseCostPerBottle are strings → Number(...).
    // receivedAt is "" when left empty: only send it if the user picked a date.
    // Don't send receivedBy: the backend should take it from the logged-in user.
    // Send it, handle errors, then go back to /dashboard/stock.
    const formData = new FormData(event.currentTarget);

    console.log(formData.get("quantity"));

    const newObject = {
      parfumId: Number(formData.get("parfumId")),
      quantity: Number(formData.get("quantity")),
      purchaseCostPerBottle: Number(formData.get("purchaseCostPerBottle"))
    };

    const data = await fetch(`http://localhost:8000/api/stock`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newObject)
    })

    if (data.status === 401) {
      router.push("/login");
      return ;
    }

    if (!data.ok){
      alert("Error While Creating New Stock Batch");
      return ;
    }

    router.push('/dashboard/stock')
    return ;
  
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/dashboard/stock"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
      >
        <ArrowLeft size={17} />
        Back to Inventory
      </Link>

      <section>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <PackagePlus size={27} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Record Delivery</h1>
        <p className="mt-2 text-sm text-slate-400">
          Add a new batch of full bottles received from a supplier.
        </p>
      </section>

      <StockForm mode="create" parfums={parfums} onSubmit={handleRecordDelivery} />
    </div>
  );
}
