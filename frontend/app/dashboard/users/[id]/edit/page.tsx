
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

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
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [userHolder, setUserHolder] = useState<User>();
  const id = params.id;

  useEffect(() => {
    const searchForUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/user/${id}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          router.push("/dashboard/users");
          return;
        }

        if (!response.ok) {
          alert("Unknown error happened");
          return;
        }

        const user: User = await response.json();
        setUserHolder(user);
      } catch {
        alert("Unable to load user information");
      }
    };

    searchForUser();
  }, [id, router]);

  // UI wiring only. We'll implement the modification logic together.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const updatedObject = {
      ...(userHolder?.firstName !== formData.get("firstName") && {
        firstName: formData.get("firstName"),
      }),

      ...(userHolder?.lastName !== formData.get("lastName") && {
        lastName: formData.get("lastName"),
      }),

      ...(userHolder?.email !== formData.get("email") && {
        email: formData.get("email"),
      }),

      ...(userHolder?.phoneNumber !== formData.get("phoneNumber") && {
        phoneNumber: formData.get("phoneNumber"),
      }),
      
      ...(userHolder?.username !== formData.get("username") && {
        username: formData.get("username"),
      }),

      ...(formData.get("password") !== "" && {
        password: formData.get("password"),
      }),
    }

    if ( !Object.keys(updatedObject).length ) {
      alert( "No Fields Were Changed" );
      return ;
    }
    
    const data = await fetch(`http://localhost:8000/api/user/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedObject)
    })
    

    if (!data.ok) {
      console.log(data.status);
      alert( "Error Heppend While Fetching !" ) 
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header (the full path is shown in the layout breadcrumb) */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold tracking-widest text-amber-400">
              USER MANAGEMENT
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Edit User
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage personal information and account permissions.
            </p>
          </div>

          <a
            href="/dashboard/users"
            className="rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-semibold transition hover:border-amber-400 hover:text-amber-400"
          >
            ← Back to users
          </a>
        </header>

        {!userHolder ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">
              Loading user information...
            </p>
          </section>
        ) : (
          <>
            {/* User summary */}
            <section className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-2xl font-bold text-amber-400">
                {userHolder.firstName?.charAt(0) || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold">
                  {userHolder.firstName} {userHolder.lastName}
                </h2>
                <p className="truncate text-sm text-slate-400">
                  {userHolder.email}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  User ID: {userHolder.id}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  userHolder.isActive
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                {userHolder.isActive ? "Active" : "Inactive"}
              </span>
            </section>

            {/* One form for all editable fields */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal information */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div className="mb-6 border-b border-slate-800 pb-5">
                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update the user's identification and contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {[
                    {
                      id: "firstName",
                      label: "First name",
                      type: "text",
                      value: userHolder.firstName,
                    },
                    {
                      id: "lastName",
                      label: "Last name",
                      type: "text",
                      value: userHolder.lastName,
                    },
                    {
                      id: "username",
                      label: "Username",
                      type: "text",
                      value: userHolder.username,
                    },
                    {
                      id: "email",
                      label: "Email address",
                      type: "email",
                      value: userHolder.email,
                    },
                    {
                      id: "phoneNumber",
                      label: "Phone number",
                      type: "tel",
                      value: userHolder.phoneNumber,
                    },
                  ].map((field) => (
                    <div
                      key={field.id}
                      className={
                        field.id === "phoneNumber" ? "sm:col-span-2" : ""
                      }
                    >
                      <label
                        htmlFor={field.id}
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        {field.label}
                      </label>

                      <input
                        id={field.id}
                        name={field.id}
                        type={field.type}
                        defaultValue={field.value ?? ""}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Account settings */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div className="mb-6 border-b border-slate-800 pb-5">
                  <h2 className="text-xl font-semibold">
                    Account Settings
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Configure access level and account status.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="Role"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Account role
                    </label>

                    <select
                      id="Role"
                      name="Role"
                      defaultValue={userHolder.Role}
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
                    <label
                      htmlFor="isActive"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Account status
                    </label>

                    <select
                      id="isActive"
                      name="isActive"
                      defaultValue={String(userHolder.isActive)}
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

              {/* Password */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <h2 className="text-xl font-semibold">
                  Change Password
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Optional. Leave blank to keep the current password.
                </p>

                <div className="mt-5 max-w-xl">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
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

              {/* Form actions */}
              <section className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <a
                  href="/dashboard/users"
                  className="rounded-lg border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </a>

                <button
                  type="submit"
                  className="rounded-lg bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                >
                  Save Changes
                </button>
              </section>
            </form>

            {/* Danger zone stays outside the form */}
            <section className="rounded-2xl border border-red-900/60 bg-red-950/20 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-red-400">
                Danger Zone
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Deactivating an account should prevent access while preserving
                its record in the database.
              </p>

              <button
                type="button"
                className="mt-5 rounded-lg border border-red-800 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-950"
              >
                Deactivate User
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
