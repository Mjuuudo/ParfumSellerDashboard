"use client";

import { FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  UserRound,
  Mail,
  AtSign,
  Phone,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useToast } from "../../../_components/Toast";


export default function CreateUserPage() {

  const router = useRouter();
  const toast = useToast();


  useEffect(() => {
  const checkOwner = async () => {
    const response = await fetch("http://localhost:8000/api/user/isOwner", {
      method: "get",
      credentials: "include",
    });

    if (response.status === 401) {
      toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
      router.push("/login");
      return;
    }

    if (response.status === 403) {
      router.push("/dashboard");
      return;
    }

    if (!response.ok) {
      toast.error(`Problem Was Detected ${response.status}`)
      router.push("/login");
    }
  };

  checkOwner();
}, [router, toast]);


  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const newUser = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      Role: formData.get("role") as "OWNER" | "EMPLOYEE",
    };
    console.log(`Data Collected !`);
    // TODO: send `newUser` to the backend

    const response = await fetch ( 'http://localhost:8000/api/user', {
      method: 'post',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUser)
    });

    if (response.status === 401) {
      toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`);
      router.push('/login');
    }

    if (!response.ok) {
      toast.error('There Is An error While Creating The User !');
      return ;
    }

    router.push('/dashboard/users');
  };

  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Navigation */}
        <div>
          <Link
            href="/dashboard/users"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
          >
            <ArrowLeft size={17} />
            Back to User Management
          </Link>
        </div>

        {/* Heading */}
        <section>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <UserPlus size={27} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Add a new member to your team and configure their account.
          </p>
        </section>

        {/* Form UI */}
        <form
          onSubmit={handleCreateUser}
          className="space-y-7 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          {/* Personal information */}
          <section className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-semibold">Personal Information</h2>
              <p className="mt-1 text-sm text-slate-400">
                Enter the new user&apos;s contact details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm text-slate-300">
                  First Name
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                  <UserRound size={18} className="text-slate-500" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="e.g. Amine"
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm text-slate-300">
                  Last Name
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                  <UserRound size={18} className="text-slate-500" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="e.g. Benali"
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-slate-300">
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                  <Mail size={18} className="text-slate-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm text-slate-300">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                  <Phone size={18} className="text-slate-500" />
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+212 ..."
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Account settings */}
          <section className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-semibold">Account Settings</h2>
              <p className="mt-1 text-sm text-slate-400">
                Configure the username and access role.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-slate-300">
                Username
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                <AtSign size={18} className="text-slate-500" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-slate-300">
                Temporary Password
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3">
                <LockKeyhole size={18} className="text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter a temporary password"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>
              <p className="text-xs text-slate-500">
                Your backend should hash the password before storing it.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm text-slate-300">
                Account Role
              </label>
              <div className="relative">
                <ShieldCheck
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <select
                  id="role"
                  name="role"
                  defaultValue="EMPLOYEE"
                  className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-500"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>
              <p className="text-xs text-slate-500">
                Assign only the permissions appropriate for this account.
              </p>
            </div>
          </section>

          {/* Actions: connect submission logic yourself */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/users"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              <UserPlus size={17} />
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
