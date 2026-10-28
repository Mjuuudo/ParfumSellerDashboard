"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter, Mail, MapPin, Pencil, Phone, Power, Search, UserPlus, UsersRound } from "lucide-react";
import { useToast } from "../../_components/Toast";
import { API_URL, customerInitials, readApiError, type Customer } from "./_components/customer";
import { CustomersEmpty, CustomersError, CustomersLoading, CustomersNoResults } from "./_components/CustomerStates";

type StatusFilter = "all" | "active" | "inactive";

export default function CustomersPage() {
  const router = useRouter();
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // +1 → the useEffect below runs again

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [togglingId, setTogglingId] = useState<number | null>(null); // row whose on/off request is running

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(API_URL, { credentials: "include" });

        if (response.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (!response.ok) {
          toast.error(await readApiError(response, "Error While Fetching The Customers"));
          setError(true);
          return;
        }

        setCustomers(await response.json());
      } catch {
        toast.error("Could not reach the server.");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [reloadKey, router, toast]);

  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };

  // On/off button: PATCH only isActive, then update that one row in state.
  const handleToggleStatus = async (customer: Customer) => {
    const isActive = !customer.isActive;
    setTogglingId(customer.id);
    try {
      const response = await fetch(`${API_URL}/${customer.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (response.status === 401) {
        toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
        router.push("/login");
        return;
      }
      if (!response.ok) {
        toast.error(await readApiError(response, `Error While Modifying The Status ${response.status}`));
        return;
      }

      setCustomers((current) => current.map((item) => (item.id === customer.id ? { ...item, isActive } : item)));
      toast.success(`${customer.fullName} is now ${isActive ? "active" : "inactive"}.`, "Status updated");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setTogglingId(null);
    }
  };

  const search = query.trim().toLowerCase();
  const visibleCustomers = customers.filter((customer) => {
    if (statusFilter === "active" && !customer.isActive) return false;
    if (statusFilter === "inactive" && customer.isActive) return false;
    if (!search) return true;
    return [customer.fullName, customer.email, customer.phoneNumber, customer.address]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  const ready = !loading && !error;
  const activeCount = customers.filter((customer) => customer.isActive).length;

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="mt-2 text-sm text-slate-400">The people you sell to, and where to deliver their orders.</p>
        </div>

        <Link
          href="/dashboard/customers/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <UserPlus size={18} />
          Add Customer
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Customers" value={ready ? customers.length : "—"} />
        <SummaryCard label="Active" value={ready ? activeCount : "—"} accent="text-emerald-400" />
        <SummaryCard label="Inactive" value={ready ? customers.length - activeCount : "—"} accent="text-red-400" />
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-amber-500/60">
          <Search size={19} className="shrink-0 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, phone or address..."
            aria-label="Search customers"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 sm:w-52">
          <Filter size={16} className="shrink-0 text-slate-500" />
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="w-full bg-transparent py-3 text-sm text-slate-300 outline-none [&>option]:bg-slate-900"
          >
            <option value="all">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers list */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <UsersRound className="text-amber-400" size={20} />
          <h2 className="font-semibold">All Customers</h2>
        </div>

        {loading ? (
          <CustomersLoading />
        ) : error ? (
          <CustomersError onRetry={retry} />
        ) : customers.length === 0 ? (
          <CustomersEmpty />
        ) : visibleCustomers.length === 0 ? (
          <CustomersNoResults onReset={resetFilters} />
        ) : (
          <>
            {/* Desktop: table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">Address</th>
                    <th className="px-6 py-4 font-medium">Since</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {visibleCustomers.map((customer) => (
                    <tr key={customer.id} className="transition hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <CustomerCell customer={customer} />
                      </td>
                      <td className="px-6 py-4 tabular-nums text-slate-300">{customer.phoneNumber}</td>
                      <td className="max-w-xs px-6 py-4 text-slate-400">
                        <span className="line-clamp-2">{customer.address}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <StatusBadge isActive={customer.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <CustomerActions
                          customer={customer}
                          busy={togglingId === customer.id}
                          onToggleStatus={handleToggleStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet: cards */}
            <ul className="divide-y divide-slate-800 lg:hidden">
              {visibleCustomers.map((customer) => (
                <li key={customer.id} className="space-y-3 px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <CustomerCell customer={customer} />
                    <CustomerActions
                      customer={customer}
                      busy={togglingId === customer.id}
                      onToggleStatus={handleToggleStatus}
                    />
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <Phone size={13} className="shrink-0 text-slate-500" />
                      {customer.phoneNumber}
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-slate-500" />
                      {customer.address}
                    </p>
                  </div>
                  <StatusBadge isActive={customer.isActive} />
                </li>
              ))}
            </ul>
          </>
        )}

        {ready && customers.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
            Showing {visibleCustomers.length} of {customers.length} customers
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-bold tabular-nums ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function CustomerCell({ customer }: { customer: Customer }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-400">
        {customerInitials(customer.fullName)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-100">{customer.fullName}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
          <Mail size={12} className="shrink-0" />
          {customer.email}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function CustomerActions({
  customer,
  busy,
  onToggleStatus,
}: {
  customer: Customer;
  busy: boolean;
  onToggleStatus: (customer: Customer) => void;
}) {
  return (
    <div className="flex shrink-0 justify-end gap-2">
      <Link
        href={`/dashboard/customers/${customer.id}/edit`}
        aria-label={`Edit ${customer.fullName}`}
        title="Edit"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
      >
        <Pencil size={17} />
      </Link>
      <button
        type="button"
        onClick={() => onToggleStatus(customer)}
        disabled={busy}
        aria-label={`${customer.isActive ? "Deactivate" : "Activate"} ${customer.fullName}`}
        title={customer.isActive ? "Deactivate" : "Activate"}
        className={`rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-50 ${
          customer.isActive ? "hover:text-red-400" : "hover:text-emerald-400"
        }`}
      >
        <Power size={17} />
      </button>
    </div>
  );
}
