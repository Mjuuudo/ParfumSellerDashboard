"use client";

import Link from "next/link";
import {
  Search,
  ListFilter,
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  ArrowLeft,
} from "lucide-react";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  Role: "OWNER" | "EMPLOYEE";
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export default function UsersPage() {

  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/user/all", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401){
          router.push('/login')
        }
        if (!response.ok) {
          alert("Error Happened While Fetching Data");
          return;
        }

        const usersData: User[] = await response.json();
        setUsers(usersData);
      } catch {
        alert("Could not reach the server");
      }
    };

    fetchUsers();
  }, []);



return (
    <div className="min-h-screen space-y-8 bg-slate-950 p-6 text-slate-100 md:p-10">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">
            User Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your team and account access.
          </p>
        </div>

        <Link
          href="/dashboard/users/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          <Plus size={18} />
          Add User
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="mt-3 text-3xl font-bold">
            {/* Render users.length here */}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Owners</p>
          <p className="mt-3 text-3xl font-bold">
            {/* Count users whose role is OWNER */}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Employees</p>
          <p className="mt-3 text-3xl font-bold">
            {/* Count users whose role is EMPLOYEE */}
          </p>
        </div>
      </div>

      {/* Search and filter UI */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
          <Search size={19} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email or username..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          <ListFilter size={18} />
          Filter
        </button>
      </div>

      {/* Dynamic users table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <UsersIcon className="text-amber-400" size={20} />
            <h2 className="font-semibold">Team Accounts</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 font-semibold text-amber-400">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-300">@{user.username}</td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          user.Role === "OWNER"
                            ? "rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400"
                            : "rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-400"
                        }
                      >
                        {user.Role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : "Never"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`Edit ${user.username}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${user.username}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
          {/* Display the actual number of fetched users here */}
        </div>
      </div>
    </div>
  );
}
