"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff, Plus, ShieldX } from "lucide-react";

interface PublicApiKeyItem {
  id: string;
  label: string;
  api_key: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

function maskKey(value: string) {
  if (value.length < 12) return "********";
  return `${value.slice(0, 10)}************${value.slice(-6)}`;
}

export function DeveloperApiKeyForm({
  initialKeys,
}: {
  initialKeys: PublicApiKeyItem[];
}) {
  const [keys, setKeys] = useState<PublicApiKeyItem[]>(initialKeys);
  const [label, setLabel] = useState("");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCount = useMemo(() => keys.filter((key) => !key.revoked_at).length, [keys]);

  async function createKey() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/settings/developer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || undefined }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { key?: PublicApiKeyItem; error?: string }
        | null;

      if (!response.ok || !payload?.key) {
        throw new Error(payload?.error ?? "Unable to create API key.");
      }

      setKeys((prev) => [payload.key!, ...prev]);
      setRevealedIds((prev) => ({ ...prev, [payload.key!.id]: true }));
      setLabel("");
      setMessage("API key created. Copy it and store it securely.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create API key.");
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(keyId: string) {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/settings/developer-key", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { key?: PublicApiKeyItem; error?: string }
        | null;

      if (!response.ok || !payload?.key) {
        throw new Error(payload?.error ?? "Unable to revoke API key.");
      }

      setKeys((prev) =>
        prev.map((key) => (key.id === keyId ? payload.key! : key)),
      );
      setMessage("API key revoked.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to revoke API key.");
    } finally {
      setLoading(false);
    }
  }

  async function copyKey(value: string) {
    await navigator.clipboard.writeText(value);
    setMessage("API key copied to clipboard.");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Developer Settings</h2>
      <p className="mt-1 text-sm text-slate-600">
        Create multiple public API keys for automations and revoke any key immediately if needed.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Active keys: {activeCount} | Endpoint: `POST /api/public/analyze`
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Key label (optional), e.g. HubSpot Sync"
          className="min-w-72 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={createKey}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          <Plus size={14} />
          Create Key
        </button>
      </div>

      {message ? <p className="mt-4 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {keys.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No API keys yet. Create one to use the public automation endpoint.
          </p>
        ) : (
          keys.map((key) => {
            const revealed = revealedIds[key.id] ?? false;
            const revoked = Boolean(key.revoked_at);
            return (
              <div
                key={key.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{key.label}</p>
                    <p className="text-xs text-slate-500">
                      Created {new Date(key.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      revoked
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {revoked ? "Revoked" : "Active"}
                  </span>
                </div>

                <p className="mt-3 break-all rounded-lg border border-slate-300 bg-white p-2 font-mono text-sm text-slate-800">
                  {revealed ? key.api_key : maskKey(key.api_key)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedIds((prev) => ({ ...prev, [key.id]: !revealed }))
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                    {revealed ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyKey(key.api_key)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Copy size={13} />
                    Copy
                  </button>

                  <button
                    type="button"
                    disabled={revoked || loading}
                    onClick={() => revokeKey(key.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldX size={13} />
                    Revoke
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
