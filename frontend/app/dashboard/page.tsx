"use client"


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  ChartNoAxesCombined,
  ArrowUpRight,
  Boxes,
  FlaskConical,
  UsersRound,
  SprayCan,
  Clock,
  TriangleAlert,
  ChevronRight,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../_components/Toast";
import BrandAvatar from "./brands/_components/BrandAvatar";
import { formatPrice } from "./parfums/_components/parfum";
import { OrderStatusBadge } from "./orders/_components/OrderBadges";
import { API_BASE, formatDate, type BrandSummary, type OrderStatus } from "./orders/_components/order";

// Shape of GET /api/dashboard/stats (backend/src/order/dashboard.service.ts).
type DashboardStats = {
  catalog: { perfumes: number; activePerfumes: number; brands: number; activeBrands: number };
  stock: {
    sealedBottles: number;
    reservedBottles: number;
    availableBottles: number;
    openBottles: number;
    remainingMl: number;
    availableMl: number;
  };
  orders: { total: number; byStatus: Record<OrderStatus, number>; pendingValue: number };
  revenue: { total: number; thisMonth: number };
  customers: { total: number; active: number };
  lowStock: { id: number; name: string; brand: BrandSummary | null; availableBottles: number; availableMl: number }[];
  recentOrders: { id: number; status: OrderStatus; pendingAt: string; customer: string | null; total: number }[];
};

const quickLinks = [
  {
    title: "New Order",
    description: "Reserve bottles and decants for a customer",
    href: "/dashboard/orders/create",
    icon: ShoppingCart,
  },
  {
    title: "Perfumes",
    description: "View and manage your perfume catalog",
    href: "/dashboard/parfums",
    icon: SprayCan,
  },
  {
    title: "Stock & Reservations",
    description: "What you have, what is held, what is free",
    href: "/dashboard/reservations",
    icon: ClipboardList,
  },
  {
    title: "Customers",
    description: "The people you sell to",
    href: "/dashboard/customers",
    icon: UsersRound,
  },
  {
    title: "Decant Bottles",
    description: "Opened bottles and their remaining volume",
    href: "/dashboard/decants",
    icon: FlaskConical,
  },
  {
    title: "User Management",
    description: "Manage team accounts and roles",
    href: "/dashboard/users",
    icon: Users,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/dashboard/stats`, { credentials: "include" });
        if (response.status === 401) {
          toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
          router.push("/login");
          return;
        }
        if (!response.ok) {
          toast.error("Error While Fetching The Dashboard Figures");
          setError(true);
          return;
        }
        setStats(await response.json());
        setError(false);
      } catch {
        toast.error("Could not reach the server.");
        setError(true);
      } finally {
        setRefreshing(false);
      }
    };

    fetchStats();
  }, [reloadKey, router, toast]);

  const refresh = () => {
    setRefreshing(true);
    setReloadKey((key) => key + 1);
  };

  const loading = !stats && !error;
  const value = (render: (s: DashboardStats) => React.ReactNode) => (stats ? render(stats) : "—");

  const statCards = [
    {
      title: "Revenue",
      value: value((s) => formatPrice(s.revenue.total)),
      description: value((s) => `${formatPrice(s.revenue.thisMonth)} this month · confirmed & delivered`),
      icon: ChartNoAxesCombined,
      href: "/dashboard/orders",
    },
    {
      title: "Orders",
      value: value((s) => s.orders.total),
      description: value((s) =>
        `${s.orders.byStatus.PENDING} pending · ${s.orders.byStatus.COMFIRMED} to deliver · ${s.orders.byStatus.DELIVERD} delivered`,
      ),
      icon: ShoppingCart,
      href: "/dashboard/orders",
    },
    {
      title: "Sealed bottles available",
      value: value((s) => s.stock.availableBottles),
      description: value((s) => `${s.stock.sealedBottles} in stock · ${s.stock.reservedBottles} reserved for orders`),
      icon: Boxes,
      href: "/dashboard/reservations",
    },
    {
      title: "Decant volume available",
      value: value((s) => `${s.stock.availableMl.toLocaleString()} ml`),
      description: value((s) => `${s.stock.remainingMl.toLocaleString()} ml left in ${s.stock.openBottles} opened bottle${s.stock.openBottles === 1 ? "" : "s"}`),
      icon: FlaskConical,
      href: "/dashboard/decants",
    },
    {
      title: "Perfumes",
      value: value((s) => s.catalog.activePerfumes),
      description: value((s) => `active · ${s.catalog.activeBrands} of ${s.catalog.brands} brands active`),
      icon: SprayCan,
      href: "/dashboard/parfums",
    },
    {
      title: "Customers",
      value: value((s) => s.customers.active),
      description: value((s) => `active · ${s.customers.total} in total`),
      icon: UsersRound,
      href: "/dashboard/customers",
    },
  ];

  // The top navigation (brand, profile link, logout) moved to the shared sidebar in ./_components/Sidebar.tsx.
  return (
      <div className="space-y-10">
        {/* Welcome section */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-amber-400">
              OVERVIEW
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Welcome back. Here’s an overview of your business.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </section>

        {error && !stats && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300 sm:flex-row sm:items-center sm:justify-between">
            Couldn&apos;t load the dashboard figures.
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-red-500/40 px-4 py-2 font-medium transition hover:bg-red-500/10"
            >
              Try again
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {stat.title}
                  </p>
                  <div className="rounded-lg bg-amber-500/10 p-3 text-amber-400 transition group-hover:bg-amber-500/20">
                    <Icon size={21} />
                  </div>
                </div>

                {loading ? (
                  <div className="mt-5 animate-pulse space-y-3" aria-busy="true">
                    <div className="h-8 w-24 rounded bg-slate-800" />
                    <div className="h-3 w-48 rounded bg-slate-800/70" />
                  </div>
                ) : (
                  <>
                    <p className="mt-5 text-3xl font-bold tabular-nums">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {stat.description}
                    </p>
                  </>
                )}
              </Link>
            );
          })}
        </section>

        {/* Live panels */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent orders */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <Clock size={18} className="text-amber-400" />
                Latest orders
              </h3>
              <Link href="/dashboard/orders" className="text-sm text-slate-400 hover:text-amber-400">
                All orders →
              </Link>
            </div>
            {loading ? (
              <PanelSkeleton />
            ) : !stats || stats.recentOrders.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                No order yet.{" "}
                <Link href="/dashboard/orders/create" className="text-amber-400 hover:underline">
                  Create the first one
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {stats.recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link href={`/dashboard/orders/${order.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-slate-800/40">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100">
                          #{order.id} · {order.customer ?? "Unknown customer"}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(order.pendingAt)}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{formatPrice(order.total)}</span>
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight size={16} className="shrink-0 text-slate-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {stats && stats.orders.byStatus.PENDING > 0 && (
              <p className="border-t border-slate-800 px-6 py-3 text-xs text-slate-500">
                {formatPrice(stats.orders.pendingValue)} waiting in {stats.orders.byStatus.PENDING} pending order
                {stats.orders.byStatus.PENDING === 1 ? "" : "s"} (stock reserved, not yet confirmed).
              </p>
            )}
          </div>

          {/* Out of stock */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <TriangleAlert size={18} className="text-amber-400" />
                Can&apos;t be sold right now
              </h3>
              <Link href="/dashboard/stock/create" className="text-sm text-slate-400 hover:text-amber-400">
                Record delivery →
              </Link>
            </div>
            {loading ? (
              <PanelSkeleton />
            ) : !stats || stats.lowStock.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                Every active perfume has a sealed bottle or at least 20 ml of decant available.
              </p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {stats.lowStock.map((parfum) => (
                  <li key={parfum.id} className="flex items-center gap-3 px-6 py-3.5">
                    <BrandAvatar name={parfum.brand?.name ?? ""} image={parfum.brand?.image ?? null} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{parfum.name}</p>
                      <p className="text-xs text-slate-500">{parfum.brand?.name ?? "—"}</p>
                    </div>
                    <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-400">
                      0 bottles · {parfum.availableMl} ml
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Quick access */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-semibold">
              Quick Access
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Navigate to the main areas of your application.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-xl cursor-pointer border border-slate-800 bg-slate-900 p-5 transition hover:border-amber-500/50 hover:bg-slate-800"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition group-hover:bg-amber-500/20">
                    <Icon size={24} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-100">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="shrink-0 text-slate-500 transition group-hover:text-amber-400"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom note */}
        <footer className="border-t border-slate-800 pt-5 text-sm text-slate-500">
          ParfumSeller Dashboard
        </footer>
      </div>
  );
}

function PanelSkeleton() {
  return (
    <div aria-busy="true" className="divide-y divide-slate-800">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4 px-6 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-slate-800" />
            <div className="h-3 w-24 rounded bg-slate-800/70" />
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
