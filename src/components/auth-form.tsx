"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm({
  mode,
  nextPath = "/",
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendPasswordReset(emailToReset: string) {
    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailToReset, {
      redirectTo,
    });
    if (resetError) throw resetError;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          if (loginError.message.toLowerCase().includes("email not confirmed")) {
            throw new Error(
              "Please verify your email first. We sent a verification link when you signed up.",
            );
          }
          throw loginError;
        }
        router.push(nextPath);
        router.refresh();
      } else {
        const { error: signupError, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signupError) {
          if (
            signupError.message.toLowerCase().includes("already registered") ||
            signupError.message.toLowerCase().includes("already been registered")
          ) {
            await sendPasswordReset(email);
            setMessage(
              "This email is already registered. We sent a password reset email so you can regain access.",
            );
            return;
          }
          throw signupError;
        }

        const existingUserWithoutSession =
          !data.session &&
          !!data.user &&
          Array.isArray(data.user.identities) &&
          data.user.identities.length === 0;

        if (existingUserWithoutSession) {
          await sendPasswordReset(email);
          setMessage(
            "This email is already registered. We sent a password reset email so you can regain access.",
          );
          return;
        }

        if (!data.session) {
          setMessage(
            "Verification email sent. Please verify your email before signing in.",
          );
        } else {
          setMessage("Account created. You can now sign in.");
        }
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">
        {mode === "login" ? "Staff Sign In" : "Create Staff Account"}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {mode === "login"
          ? "Access the AI enquiry assistant dashboard."
          : "Create an account to analyze and track enquiries."}
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

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            minLength={8}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" href={mode === "login" ? "/auth/signup" : "/auth/login"}>
          {mode === "login" ? "Sign up" : "Sign in"}
        </Link>
      </p>
      {mode === "login" ? (
        <p className="mt-2 text-sm text-slate-600">
          Forgot your password?{" "}
          <Link className="font-semibold text-blue-700 hover:text-blue-800" href="/auth/forgot-password">
            Reset it
          </Link>
        </p>
      ) : null}
    </div>
  );
}
