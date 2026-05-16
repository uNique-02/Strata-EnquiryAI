"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";

interface DeveloperApiKeyFormProps {
  initialPublicApiKey: string | null;
}

function maskKey(value: string) {
  if (value.length < 10) return "••••••••";
  return `${value.slice(0, 10)}••••••••••••${value.slice(-6)}`;
}

export function DeveloperApiKeyForm({ initialPublicApiKey }: DeveloperApiKeyFormProps) {
  const [apiKey, setApiKey] = useState<string | null>(initialPublicApiKey);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const keyDisplay = useMemo(() => {
    if (!apiKey) return "No key generated yet.";
    return revealed ? apiKey : maskKey(apiKey);
  }, [apiKey, revealed]);

  async function createOrRotateKey() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/settings/developer-key", {
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => null)) as
        | { publicApiKey?: string; error?: string }
        | null;

      if (!response.ok || !payload?.publicApiKey) {
        throw new Error(payload?.error ?? "Unable to generate developer API key.");
      }

      setApiKey(payload.publicApiKey);
      setRevealed(true);
      setMessage("Developer API key generated. Store it securely.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate developer API key.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setMessage("API key copied to clipboard.");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Developer Settings</h2>
      <p className="mt-1 text-sm text-slate-600">
        Generate your public API key for external automations. Use this key with
        `POST /api/public/analyze`.
      </p>

      <div className="mt-5 rounded-xl border border-slate-300 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public API Key</p>
        <p className="mt-2 break-all font-mono text-sm text-slate-800">{keyDisplay}</p>
      </div>

      {message ? <p className="mt-4 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={createOrRotateKey}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          <RefreshCw size={14} />
          {loading ? "Generating..." : apiKey ? "Rotate API Key" : "Generate API Key"}
        </button>

        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          disabled={!apiKey}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          {revealed ? "Hide Key" : "Show Key"}
        </button>

        <button
          type="button"
          onClick={copyKey}
          disabled={!apiKey}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Copy size={14} />
          Copy Key
        </button>
      </div>
    </div>
  );
}

