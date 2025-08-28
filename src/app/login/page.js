"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginSalesMutation } from "@/redux/features/api/zohoApi";
// 👇 import your hooks from the zohoApi slice

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState(null);

  const [loginSales, { isLoading }] = useLoginSalesMutation();

  const validate = () => {
    if (!email.trim()) return "Please enter your email";
    const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
    if (!emailOk) return "Please enter a valid email";
    if (!password) return "Please enter your password";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);

    const problem = validate();
    if (problem) {
      setClientError(problem);
      return;
    }

    try {
      // Your backend accepts { identifier, password } or { email, password }
      await loginSales({ identifier: email.trim(), password }).unwrap();

      // Optionally you can refetch profile in parallel in a layout using useGetSalesMeQuery
      router.push("/dashboard");
    } catch (err) {
      // RTKQ error shape: err?.data?.message or fallback
      setClientError(err?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 mt-19">
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Art + Brand */}
        <div className="relative hidden lg:flex items-center justify-center rounded-3xl overflow-hidden bg-slate-900">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          </div>

          <div className="relative z-10 px-8 text-center text-white">
            <div className="mx-auto mb-8 h-20 w-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shadow-xl ring-1 ring-white/10">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" className="opacity-80" />
                <path d="M12 7l4 2.25v4.5L12 16l-4-2.25v-4.5L12 7z" className="opacity-60" />
              </svg>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">Welcome to your workspace</h1>
            <p className="mt-2 text-sm text-white/70 max-w-md">
              Sign in to manage products, orders, and customers with speed and confidence.
            </p>

            <ul className="mt-10 grid grid-cols-2 gap-3 text-left text-sm">
              {["Bank‑grade security", "Real‑time analytics", "GST‑ready invoicing", "Team roles & permissions"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 text-xs">✓</span>
                  <span className="text-white/80">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Form card */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 blur-2xl opacity-60 bg-gradient-to-br from-indigo-200 to-fuchsia-200 rounded-3xl" />
          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Login with your email and password.</p>
            </div>

            {(clientError) && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {clientError}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-400 focus:outline-none"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                  {/* <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot?</Link> */}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-400 focus:outline-none"
                    autoComplete="current-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a3 3 0 104.24 4.24" />
                        <path d="M9.88 4.24A9.53 9.53 0 0112 4c7 0 10 8 10 8a12.29 12.29 0 013.07 5.2" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  Remember me
                </label>
                <span className="text-xs text-slate-400">v1.0</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group cursor-pointer relative inline-flex w-full items-center justify-center gap-2 rounded-xl 
                           bg-[#3E57A7] px-4 py-2.5 text-white shadow-lg 
                           transition hover:bg-[#324A91] focus:outline-none disabled:opacity-70"
              >
                <span className="absolute inset-0 -z-10 rounded-xl 
                                bg-gradient-to-r from-[#3E57A7] to-[#2E4788] 
                                opacity-0 blur transition group-hover:opacity-40" />
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Signing in...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                    Sign in
                  </span>
                )}
              </button>
            </form>
          </div>

          <div className="absolute -inset-2 -z-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 blur-2xl" />
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}
