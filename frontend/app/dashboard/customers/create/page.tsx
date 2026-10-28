"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "../../../_components/Toast";
import CustomerForm from "../_components/CustomerForm";
import { API_URL, readApiError } from "../_components/customer";

export default function CreateCustomerPage() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const newCustomer = {
      fullName: String(formData.get("fullName")).trim(),
      email: String(formData.get("email")).trim(),
      phoneNumber: String(formData.get("phoneNumber")).trim(),
      address: String(formData.get("address")).trim(),
    };

    setSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      if (response.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push("/login");
        return;
      }
      if (response.status === 409) {
        toast.error(await readApiError(response, "This customer already exists."), "Already exists");
        return;
      }
      if (!response.ok) {
        toast.error(await readApiError(response, `Error While Creating The Customer ${response.status}`));
        return;
      }

      toast.success(`${newCustomer.fullName} was added to your customers.`, "Customer created");
      router.push("/dashboard/customers");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
      >
        <ArrowLeft size={17} />
        Back to Customers
      </Link>

      <section>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <UserPlus size={27} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Add Customer</h1>
        <p className="mt-2 text-sm text-slate-400">Save a customer&apos;s contact details for their orders.</p>
      </section>

      <CustomerForm mode="create" submitting={submitting} onSubmit={handleCreateCustomer} />
    </div>
  );
}
