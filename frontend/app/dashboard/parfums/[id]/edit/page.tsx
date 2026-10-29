"use client";

import { API_BASE_URL } from "@/app/_lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Brand } from "../../../brands/_components/brand";
import ParfumForm from "../../_components/ParfumForm";
import type { Parfum } from "../../_components/parfum";
import { useRouter } from "next/navigation"
import { useToast } from "../../../../_components/Toast";
import { LoadingCard, LoadErrorCard } from "../../../_components/LoadStateCards";


export default function EditParfumPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  // The perfume and the brands are fetched below; the form is only rendered once BOTH
  // have loaded, because its fields use defaultValue (read once, when the form appears).
  const [brands, setBrands] = useState<Brand[]>([]);
  // The perfume being edited. null until the fetch below has finished.
  const [parfum, setParfum] = useState<Parfum | null>(null);
  const router =  useRouter();
  const toast = useToast();
  // true → the loading card turns into an error card with "Try again".
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // +1 → the useEffect below runs again

  useEffect(() => {
    const fetchParfum = async () => {
      try {
      const data = await fetch(`${API_BASE_URL}/parfum/${id}`, {
        method: "get",
        credentials: "include",
      });

      if (data.status === 401){
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push('/login');
        return ;
      }
      if (!data.ok) {
        toast.error(`Error Occured ! ${data.status}`);
        setLoadError(true);
        return ;
      }

      const result = await data.json();
      setParfum(result);
      } catch {
        toast.error("Could not reach the server.");
        setLoadError(true);
      }
    }


    const fetchBrands = async () => {
      try {
      const data = await fetch(`${API_BASE_URL}/brand`, {
        method: "get",
        credentials: "include",
      });

      if (data.status === 401){
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push('/login');
        return ;
      }
      if (!data.ok) {
        toast.error(`Error Occured ! ${data.status}`);
        setLoadError(true);
        return ;
      }

      const result = await data.json();
      setBrands(result);
      } catch {
        setLoadError(true); // fetchParfum already shows the "server unreachable" popup
      }
    }

    fetchParfum();
    fetchBrands();
  }, [id, router, toast, reloadKey])

  const retry = () => {
    setLoadError(false);
    setReloadKey((key) => key + 1);
  };


  async function handleUpdateParfum(event: FormEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page on submit. Keep this line.
    event.preventDefault();

    // The form is only shown once `parfum` has loaded, but TypeScript doesn't know that.
    if (!parfum) return ;

    // FormData values are always strings: convert numbers with Number()
    // and isActive ("true" / "false") to a real boolean.
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name")).trim();
    const brandId = Number(formData.get("brandId"));
    const originalVolume = Number(formData.get("originalVolume"));
    const completePrice = Number(formData.get("completePrice"));
    const decant10Price = Number(formData.get("decant10Price"));
    const decant20Price = Number(formData.get("decant20Price"));
    const isActive = formData.get("isActive") === "true";

    // Only send the fields that are different from what was loaded.
    const updatedObject = {
      ...(name !== parfum.name && { name }),
      ...(brandId !== parfum.brandId && { brandId }),
      ...(originalVolume !== parfum.originalVolume && { originalVolume }),
      ...(completePrice !== parfum.completePrice && { completePrice }),
      ...(decant10Price !== parfum.decant10Price && { decant10Price }),
      ...(decant20Price !== parfum.decant20Price && { decant20Price }),
      ...(isActive !== parfum.isActive && { isActive }),
    };

    if ( !Object.keys(updatedObject).length ) {
      toast.info("No Fields Were Changed", "Nothing to save");
      return ;
    }

    const data = await fetch(`${API_BASE_URL}/parfum/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedObject),
    });

    if (data.status === 401) {
      toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
      router.push('/login');
      return ;
    }
    if (data.status === 409) {
      toast.error("A perfume with this brand, name and size already exists !", "Already exists");
      return ;
    }
    if (!data.ok) {
      toast.error(`Error While Modifying The Perfume ${data.status}`);
      return ;
    }

    router.replace('/dashboard/parfums');
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

      {/* Wait for BOTH the perfume and the brands: the form's fields use defaultValue,
          which is only read when the form first appears. */}
      {loadError ? (
        <LoadErrorCard what="this perfume" onRetry={retry} />
      ) : !parfum || brands.length === 0 ? (
        <LoadingCard label="Loading perfume information..." />
      ) : (
        <ParfumForm mode="edit" parfum={parfum} brands={brands} onSubmit={handleUpdateParfum} />
      )}
    </div>
  );
}
