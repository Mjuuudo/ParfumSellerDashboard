
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const loginData = {
      username,
      password,
    };

    const result = await fetch("http://localhost:8000/api/auth/login", {
        method: "post",
        credentials: "include",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(loginData)
    })

    if (!result.ok) {
        setUsername("");
        setPassword("");
        alert("Login failed. Please check your credentials and try again.");
        return;
    }

    router.push("/dashboard");
    // We'll connect this to the NestJS login API next.
    console.log({ username, password });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl md:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-amber-300 via-amber-600 to-slate-900 p-10 text-slate-950 md:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em]">
              Parfum Seller
            </p>
            <h1 className="mt-8 text-4xl font-semibold leading-tight">
              Your business.
              <br />
              Your signature.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-900/80">
              Manage your perfume inventory and sales from one place.
            </p>
          </div>

          <p className="text-xs font-medium">
            INVENTORY · SALES · CUSTOMERS
          </p>
        </section>

        <section className="p-8 sm:p-12">
          <div className="mb-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-xl font-bold text-slate-950">
              P
            </div>
            <p className="text-sm text-amber-400">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold">Sign in</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pr-20 outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-sm text-slate-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Sign in
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Authorized personnel only.
          </p>
        </section>
      </div>
    </main>
  );
}
