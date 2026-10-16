"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export type User = {
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


export default function EditUserPage() {

  const params = useParams<{id: string}> ();
  const router = useRouter();
  const [userHolder, setUserHolder] = useState<User>();
  const id = params.id;

  useEffect( () => {

    const searchForUser = async () => {
      const data = await fetch(`http://localhost:8000/api/user/${id}`, {
        method: "get",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (data.status === 401){
        router.push('/login');
      } else if ( data.status === 403 ){
        router.push('/dashboard/users');
      }else if (!data.ok) {
        alert('Unkown Error happend');
      }

      const user = await data.json();
      setUserHolder(user);
    }

    searchForUser();
  }, [])



  console.log(userHolder?.Role);
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-400">
              DASHBOARD / USERS / EDIT
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Edit User
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Update personal information and account permissions.
            </p>
          </div>

          <a
            href="/dashboard/users"
            className="inline-flex w-fit items-center rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-amber-400 hover:text-amber-400"
          >
            ← Back to users
          </a>
        </header>

        {/* User identity */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10 text-xl font-bold text-amber-400">
              U
            </div>
            <div>
              <h2 className="text-lg font-semibold">User Information</h2>
              <p className="text-sm text-slate-400">
                Editing account details
              </p>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-800 pb-5">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="mt-1 text-sm text-slate-400">
              Update the user's contact and identification details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-300">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                value={userHolder?.firstName}
                type="text"
                placeholder="Enter first name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-300">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                value={userHolder?.lastName}
                type="text"
                placeholder="Enter last name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={userHolder?.username}
                placeholder="Enter username"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                value={userHolder?.email}
                type="email"
                placeholder="Enter email address"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-slate-300">
                Phone number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                value={userHolder?.phoneNumber}

                type="tel"
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>
        </section>

        {/* Account settings */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-800 pb-5">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            <p className="mt-1 text-sm text-slate-400">
              Configure the user's role and account status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-300">
                Account role
              </label>
              <select
                id="role"
                name="role"
                defaultValue={userHolder?.Role ?? "EMPLOYEE"}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                
                <option value="EMPLOYEE">Employee</option>
                <option value="OWNER">Owner</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Owners can access administrative features.
              </p>
            </div>

            <div>
              <label htmlFor="isActive" className="mb-2 block text-sm font-medium text-slate-300">
                Account status
              </label>
              <select
                id="isActive"
                name="isActive"
                defaultValue={userHolder?.Role ?? "Active"}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Inactive accounts should not be able to sign in.
              </p>
            </div>
          </div>
        </section>

        {/* Optional password section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <p className="mt-1 text-sm text-slate-400">
              Optional. Leave blank to keep the current password.
            </p>
          </div>

          <div className="max-w-xl">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter a new password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </section>

        {/* Save actions */}
        <section className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <a
            href="/dashboard/users"
            className="rounded-lg border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </a>

          <button
            type="button"
            className="rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Save Changes
          </button>
        </section>

        {/* Deactivation area */}
        <section className="rounded-2xl border border-red-900/60 bg-red-950/20 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-red-400">
            Danger Zone
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Deactivating this account prevents the user from accessing the
            application. The account record remains in the database.
          </p>

          <details className="mt-5">
            <summary className="w-fit cursor-pointer rounded-lg border border-red-800 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-950">
              Deactivate User
            </summary>

            <div className="mt-4 rounded-xl border border-red-900/60 bg-slate-950 p-4">
              <p className="text-sm font-medium text-slate-200">
                Are you sure you want to deactivate this account?
              </p>
              <p className="mt-2 text-sm text-slate-400">
                You can change the account status later if your backend
                supports reactivation.
              </p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Confirm Deactivation
              </button>
            </div>
          </details>
        </section>

      </div>
    </main>
  );
}
