"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) throw resetError;

      setMessage("Password reset email sent. Please check your inbox.");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to send reset email.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Reset Password</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter your account email and we will send a password reset link.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {message ? (
          <p className="rounded-xl bg-emerald-100 p-3 text-sm text-emerald-700">{message}</p>
        ) : null}
        {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Back to{" "}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" href="/auth/login">
          sign in
        </Link>
      </p>
    </div>
  );
}

