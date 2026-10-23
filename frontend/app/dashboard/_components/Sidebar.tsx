"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound, X } from "lucide-react";
import { navGroups, isActivePath } from "./navigation";

type SidebarProps = {
  // Called after a navigation link is clicked (used to close the mobile drawer).
  onNavigate?: () => void;
  // Only passed in the mobile drawer, where the sidebar needs its own close button.
  onClose?: () => void;
};

export default function Sidebar({ onNavigate, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Same logout call and redirect that used to live in the dashboard top navigation.
  async function handleLogout( ) {
    const data = await fetch('http://localhost:8000/api/auth/logout', {
      method: 'post',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!data.ok) {
      alert('Logout Opperation Not Success !')
      return ;
    }

    router.push('/login');
  }

  const profileActive = isActivePath(pathname, "/dashboard/profile");

  return (
    <div className="flex h-full flex-col border-r border-slate-800 bg-slate-900">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
        <Link href="/dashboard" onClick={onNavigate} className="block">
          <p className="text-xl font-bold tracking-wide text-slate-100">
            Parfum<span className="text-amber-400">Seller</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">Business Dashboard</p>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Dashboard" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {group.title}
            </p>

            <ul className="mt-2 space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                if (!item.href) {
                  return (
                    <li key={item.label}>
                      <span
                        aria-disabled="true"
                        title="Not available yet"
                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600"
                      >
                        <Icon size={18} />
                        <span className="flex-1">{item.label}</span>
                        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          Soon
                        </span>
                      </span>
                    </li>
                  );
                }

                const active = isActivePath(pathname, item.href);

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-amber-500/10 text-amber-400"
                          : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-amber-400" />
                      )}
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile and logout */}
      <div className="space-y-1 border-t border-slate-800 p-3">
        <Link
          href="/dashboard/profile"
          onClick={onNavigate}
          aria-current={profileActive ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            profileActive
              ? "bg-amber-500/10 text-amber-400"
              : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          }`}
        >
          <UserRound size={18} />
          Profile
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}
