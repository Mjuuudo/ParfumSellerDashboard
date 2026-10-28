"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../../../_components/Toast";
import { LoadErrorCard, LoadingCard } from "../../../_components/LoadStateCards";
import CustomerForm from "../../_components/CustomerForm";
import { API_URL, readApiError, type Customer } from "../../_components/customer";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { credentials: "include" });

        if (response.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (response.status === 404 || response.status === 400) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          toast.error(await readApiError(response, "Error While Fetching The Customer"));
          setLoadError(true);
          return;
        }

        setCustomer(await response.json());
      } catch {
        toast.error("Could not reach the server.");
        setLoadError(true);
      }
    };

    fetchCustomer();
  }, [id, reloadKey, router, toast]);

  const retry = () => {
    setLoadError(false);
    setReloadKey((key) => key + 1);
  };

  async function handleUpdateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer) return;

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName")).trim();
    const email = String(formData.get("email")).trim().toLowerCase();
    const phoneNumber = String(formData.get("phoneNumber")).trim();
    const address = String(formData.get("address")).trim();
    const isActive = formData.get("isActive") === "true";

    // Only send what changed.
    const updatedObject = {
      ...(fullName !== customer.fullName && { fullName }),
      ...(email !== customer.email && { email }),
      ...(phoneNumber !== customer.phoneNumber && { phoneNumber }),
      ...(address !== customer.address && { address }),
      ...(isActive !== customer.isActive && { isActive }),
    };

    if (!Object.keys(updatedObject).length) {
      toast.info("No Fields Were Changed", "Nothing to save");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedObject),
      });

      if (response.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push("/login");
        return;
      }
      if (response.status === 409) {
        toast.error(await readApiError(response, "Another customer already uses these details."), "Already exists");
        return;
      }
      if (!response.ok) {
        toast.error(await readApiError(response, `Error While Modifying The Customer ${response.status}`));
        return;
      }

      toast.success(`${fullName}'s details were saved.`, "Customer updated");
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
        <p className="text-sm font-semibold tracking-widest text-amber-400">CUSTOMERS</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Customer</h1>
        <p className="mt-2 text-sm text-slate-400">Update the contact details and status of customer #{id}.</p>
      </section>

      {notFound ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h2 className="text-xl font-semibold">Customer #{id} not found</h2>
          <p className="mt-2 text-sm text-slate-400">It may have been removed, or the link is wrong.</p>
        </section>
      ) : loadError ? (
        <LoadErrorCard what="this customer" onRetry={retry} />
      ) : !customer ? (
        <LoadingCard label="Loading customer information..." />
      ) : (
        <CustomerForm mode="edit" customer={customer} submitting={submitting} onSubmit={handleUpdateCustomer} />
      )}
    </div>
  );
}
