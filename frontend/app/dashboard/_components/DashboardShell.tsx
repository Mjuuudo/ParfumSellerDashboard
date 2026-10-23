"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Menu } from "lucide-react";
import Sidebar from "./Sidebar";

// Labels for each URL segment in the breadcrumb. Numeric segments (user ids) are handled separately.
const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  users: "User Management",
  create: "Create User",
  profile: "Profile",
  edit: "Edit",
};

// Only these paths have a page, so only these crumbs are rendered as links
// (there is no /dashboard/users/[id] page, only /dashboard/users/[id]/edit).
const linkablePaths = new Set([
  "/dashboard",
  "/dashboard/users",
  "/dashboard/users/create",
  "/dashboard/profile",
]);

function buildBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = /^\d+$/.test(segment)
      ? `User #${segment}`
      : segmentLabels[segment] ?? segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLink: !isLast && linkablePaths.has(href) };
  });
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const breadcrumb = buildBreadcrumb(pathname);

  // While the mobile drawer is open: close it with Escape and stop the page behind it from scrolling.
  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile / tablet drawer */}
      {mobileNavOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileNav}
            className="absolute inset-0 bg-slate-950/70"
          />
          <aside className="relative h-full w-72 max-w-[85vw]">
            <Sidebar onNavigate={closeMobileNav} onClose={closeMobileNav} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar: menu button (small screens) + breadcrumb */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg border border-slate-800 p-2 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1.5 text-sm">
              {breadcrumb.map((crumb, index) => (
                <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight size={15} className="shrink-0 text-slate-600" />
                  )}
                  {crumb.isLink ? (
                    <Link
                      href={crumb.href}
                      className="truncate text-slate-400 transition hover:text-amber-400"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={index === breadcrumb.length - 1 ? "page" : undefined}
                      className={`truncate ${
                        index === breadcrumb.length - 1
                          ? "font-medium text-slate-100"
                          : "text-slate-400"
                      }`}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
