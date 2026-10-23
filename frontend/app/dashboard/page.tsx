"use client"


import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  ChartNoAxesCombined,
  ArrowUpRight,
} from "lucide-react";

const dashboardStats = [
  {
    title: "Total Products",
    value: "—",
    description: "Products in your inventory",
    icon: Package,
  },
  {
    title: "Total Orders",
    value: "—",
    description: "Orders received",
    icon: ShoppingCart,
  },
  {
    title: "Total Revenue",
    value: "—",
    description: "Revenue overview",
    icon: ChartNoAxesCombined,
  },
];

const quickLinks = [
  {
    title: "User Management",
    description: "Manage team accounts and roles",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Products",
    description: "View and manage your perfume catalog",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Orders",
    description: "View and manage customer orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
];

export default function DashboardPage() {

  // The top navigation (brand, profile link, logout) moved to the shared sidebar in ./_components/Sidebar.tsx.
  return (
      <div className="space-y-10">
        {/* Welcome section */}
        <section>
          <p className="text-sm font-medium text-amber-400">
            OVERVIEW
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Welcome back. Here’s an overview of your business.
          </p>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {stat.title}
                  </p>
                  <div className="rounded-lg bg-amber-500/10 p-3 text-amber-400">
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {stat.description}
                </p>
              </div>
            );
          })}
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
