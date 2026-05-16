"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface ModelSettingsFormProps {
  initialSettings: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };
}

export function ModelSettingsForm({ initialSettings }: ModelSettingsFormProps) {
  const [defaultModel, setDefaultModel] = useState(initialSettings.defaultModel);
  const [temperature, setTemperature] = useState(initialSettings.temperature.toString());
  const [maxTokens, setMaxTokens] = useState(initialSettings.maxTokens.toString());
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setSaving(true);

    try {
      const response = await fetch("/api/settings/model", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultModel: defaultModel.trim(),
          temperature: Number(temperature),
          maxTokens: Number(maxTokens),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | Record<string, unknown>
        | null;

      if (!response.ok) {
        throw new Error(payload && "error" in payload ? String(payload.error) : "Unable to save settings.");
      }

      setStatus("Settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-slate-900">Model Settings</h2>
      <p className="mt-1 text-sm text-slate-600">
        Configure OpenRouter defaults for future enquiry analysis.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Default OpenRouter Model
          </span>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={defaultModel}
            onChange={(event) => setDefaultModel(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Temperature</span>
          <input
            type="number"
            min={0}
            max={1.5}
            step={0.1}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Max Tokens</span>
          <input
            type="number"
            min={100}
            max={2000}
            step={1}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={maxTokens}
            onChange={(event) => setMaxTokens(event.target.value)}
            required
          />
        </label>
      </div>

      {status ? <p className="mt-4 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        <Save size={14} />
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}

