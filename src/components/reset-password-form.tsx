"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);

  const hasRecoveryHint = useMemo(
    () =>
      typeof window !== "undefined" &&
      (window.location.href.includes("type=recovery") ||
        window.location.href.includes("access_token=")),
    [],
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setRecoveryReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setRecoveryReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setMessage("Password updated. You can now sign in with your new password.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reset password. Please retry from the email link.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Set New Password</h1>
      <p className="mt-1 text-sm text-slate-600">
        Open this page from your reset email link, then choose a new password.
      </p>

      {!recoveryReady && !hasRecoveryHint ? (
        <p className="mt-4 rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
          Recovery session not detected. Please open this page directly from your password reset email.
        </p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">New Password</span>
          <input
            type="password"
            minLength={8}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</span>
          <input
            type="password"
            minLength={8}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {loading ? "Updating..." : "Update Password"}
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

