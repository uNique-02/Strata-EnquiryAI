import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ModelSettingsForm } from "@/components/model-settings-form";
import { getServerEnv } from "@/lib/env";
import { getOrCreateUserModelSettings } from "@/lib/services/enquiry-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

export default async function SettingsPage() {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) {
    redirect("/auth/login");
  }

  const env = getServerEnv();
  const settings = await getOrCreateUserModelSettings({
    supabase,
    userId: user.id,
    envDefaultModel: env.openRouterDefaultModel,
  });

  return (
    <AppShell userEmail={user.email ?? "staff@unknown"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">
          Set your default OpenRouter model and generation controls for enquiry analysis.
        </p>
      </div>

      <ModelSettingsForm initialSettings={settings} />
    </AppShell>
  );
}

