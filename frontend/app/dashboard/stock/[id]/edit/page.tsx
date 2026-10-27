"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Parfum } from "../../../parfums/_components/parfum";
import type { StockBatch } from "../../_components/stockBatch";
import StockForm from "../../_components/StockForm";
import { useRouter } from "next/navigation"


export default function EditStockBatchPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  // TODO(you): in a useEffect, fetch this batch (GET /api/stock/${id}) and the perfumes,
  // and store them here. The form below only appears once BOTH are loaded, because its
  // fields use defaultValue (read once, when the form first appears).
  const [batch, setBatch] = useState<StockBatch | null>(null);
  const [parfums, setParfums] = useState<Parfum[]>([]);
  const router = useRouter()
  useEffect( () => {
    const fetchData = async() => {
      const data = await fetch(`http://localhost:8000/api/stock/${id}`, {
        method: "get",
        credentials: "include"
      });

      if ( data.status === 401 ) {
        router.push('/login')
        return ;
      }

      if ( !data.ok ) {
        alert("Data Fetching Error")
        return ;
      }

      setBatch(await data.json());

      const parfums = await fetch(`http://localhost:8000/api/parfum`, {
        method: "get",
        credentials: "include"
      });

      if ( !parfums.ok ) {
        alert("Data Fetching Error")
        return ;
      }

      setParfums( await parfums.json());
      
      
      }
    
      fetchData();
  }, [])



  async function handleUpdateBatch(event: FormEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page on submit. Keep this line.
    event.preventDefault();

    // TODO(you): read "parfumId", "quantity" and "purchaseCostPerBottle" with FormData,
    // convert them with Number(...), keep only the ones that differ from `batch`,
    // PATCH them to /api/stock/${id}, handle errors, then go back to /dashboard/stock.
    // (Same pattern as your perfume edit page.)
    const formData = new FormData(event.currentTarget);

    const newObject = {
      parfumId: Number(formData.get("parfumId")),
      quantity: Number(formData.get("quantity")),
      purchaseCostPerBottle: Number(formData.get("purchaseCostPerBottle"))
    };

    const data = await fetch(`http://localhost:8000/api/stock/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newObject)
    });

    if ( data.status === 401 || data.status === 403){
      router.push('/login');
      return ;
    }

    if ( !data.ok ) {
      alert(`Error While fetching Data ${data.status}!`);
      return ;
    }

    router.push('/dashboard/stock');
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
        <p className="text-sm font-semibold tracking-widest text-amber-400">INVENTORY</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Delivery</h1>
        <p className="mt-2 text-sm text-slate-400">
          Correct the details of stock batch #{id}.
        </p>
      </section>

      {!batch || parfums.length === 0 ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-slate-400">Loading delivery information...</p>
        </section>
      ) : (
        <StockForm mode="edit" batch={batch} parfums={parfums} onSubmit={handleUpdateBatch} />
      )}
    </div>
  );
}
