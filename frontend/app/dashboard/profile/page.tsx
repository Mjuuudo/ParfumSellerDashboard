
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../_components/Toast";


type UserData = {
    id: number;
    username: string;
    role: string;
};

export default function ProfilePage() {

    const [userData, setUserData] = useState<UserData | null>(null);
    const router = useRouter();
    const toast = useToast();


    async function handleProfileModification( ) {

      router.push(`/dashboard/users/${userData?.id}/edit`);
    }
    async function handleLogout ( ) {
        const data = await fetch('http://localhost:8000/api/auth/logout', {
        method: 'post',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!data.ok) {
        toast.error('Logout Opperation Not Success !')
        return ;
      }

      router.push('/login');
    }

    useEffect(() => {
        async function fetchUserData () {
            try {
            const response = await fetch ("http://localhost:8000/api/user/me", {
                method: "get",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                }
            });

            console.log(response.status);
            if (response.status === 401) {
              toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
              router.push("/login");
              return;
            }
            if (!response.ok) {
                toast.error("Failed to fetch user data. Please try again.");
                return;
            }

            const userData = await response.json();

            setUserData(userData);
            } catch {
                toast.error("Could not reach the server.");
            }
        }

        fetchUserData();
    }, [router, toast]);



    
  return (
    <div>
      <div className="mx-auto max-w-4xl">

        {/* Page Header ("Back to dashboard" is now covered by the sidebar and breadcrumb) */}
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Account settings
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your personal account information.
          </p>
        </header>

        {/* Profile Card */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-amber-300 via-amber-600 to-slate-800" />

          <div className="px-6 pb-7 sm:px-8">

            {/* Avatar placeholder */}
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-slate-900 bg-amber-400 text-3xl font-bold text-slate-950">
              U
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {userData?.username ?? "Your Username"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Perfume Store Account
            </p>

            {/* Role badge placeholder */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {userData?.role ?? "User Role"}
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

          <div>
            <h3 className="text-lg font-semibold">
              Personal Information
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Your account details.
            </p>
          </div>

          <div className="mt-6 divide-y divide-slate-800">

            {/* Username */}
            <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-400">
                Username
              </span>

              <span className="text-sm font-medium">
                {userData?.username ?? "Your Username"}
              </span>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-400">
                Role
              </span>

              <span className="text-sm font-medium">
                {userData?.role ?? "User Role"}
              </span>
            </div>

            {/* User ID */}
            <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-400">
                User ID
              </span>

              <span className="text-sm font-medium">
                {userData?.id ?? "Not assigned"}
              </span>
            </div>

          </div>
        </section>

        {/* Account Actions */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

          <h3 className="text-lg font-semibold">
            Account Actions
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Account management options.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium transition hover:border-amber-400/40 hover:bg-slate-700"
              onClick={handleProfileModification}
            >
              Edit Profile
            </button>

            <button
              type="button"
              className="rounded-xl border cursor-pointer border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-400/10"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        </section>

      </div>
    </div>
  );
}
