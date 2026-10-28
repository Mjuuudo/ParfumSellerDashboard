"use client";

import Link from "next/link";
import {
  Search,
  ListFilter,
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  CircleAlert,
} from "lucide-react";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../_components/Toast";


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
  const toast = useToast();

  // Loading / error state of the table (same approach as the decant bottles page).
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // +1 → the useEffect below runs again

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/user/all", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401){
          router.push('/login')
        }else if ( response.status === 403 ) {
          router.push('/dashboard')
        }

        
        if (!response.ok) {
          toast.error("Error Happened While Fetching Data");
          setError(true);
          return;
        }

        const usersData: User[] = await response.json();
        setUsers(usersData);
      } catch {
        toast.error("Could not reach the server");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [reloadKey, router, toast]);

  // "Try again" button of the error state.
  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };


  // Called on every keystroke in the search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: store e.target.value in state and filter the users list
  };

  // Called when the "Filter" button is clicked
  const handleFilterClick = () => {
    // TODO: open a filter menu / toggle a role filter (OWNER, EMPLOYEE)
  };

  // Called when the edit (pencil) button of a row is clicked
  const handleEdit = (user: User) => {
    // TODO: e.g. router.push(`/dashboard/users/${user.id}/edit`)
  
    if (typeof user.id !== 'number')
        return ;


    router.push(`/dashboard/users/${user.id}/edit`)
  
  
  };

  // Called when the delete (trash) button of a row is clicked
  const handleDelete = async (user: User) => {
    // TODO: confirm, send DELETE request to the API, then remove the user from state
    
  
  };


return (
    <div className="space-y-8">
      {/* Heading ("Back to Dashboard" is now covered by the sidebar and breadcrumb) */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
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
            onChange={handleSearchChange}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>

        <button
          type="button"
          onClick={handleFilterClick}
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
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} aria-busy="true" className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 rounded bg-slate-800" />
                          <div className="h-3 w-44 rounded bg-slate-800/70" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-3 w-20 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-28 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-slate-800" /></td>
                    <td className="px-6 py-4" />
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} role="alert" className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                      <CircleAlert size={26} />
                    </div>
                    <p className="mt-4 font-semibold text-slate-100">Couldn&apos;t load users</p>
                    <p className="mt-1 text-sm text-slate-400">Something went wrong while contacting the server.</p>
                    <button
                      type="button"
                      onClick={retry}
                      className="mt-6 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
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
                      <span
                        className={
                          user.isActive
                            ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400"
                            : "rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>


                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`Edit ${user.username}`}
                          onClick={() => handleEdit(user)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${user.username}`}
                          onClick={() => handleDelete(user)}
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
