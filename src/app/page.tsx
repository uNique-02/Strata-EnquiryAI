import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EnquiryWorkspace } from "@/components/enquiry-workspace";
import { getServerEnv } from "@/lib/env";
import { getOrCreateUserModelSettings } from "@/lib/services/enquiry-service";
import { getUserEnquiryById } from "@/lib/services/query-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

interface PageProps {
  searchParams: Promise<{ enquiryId?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
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

  const params = await searchParams;
  const enquiryId = params.enquiryId;
  const selectedEnquiry =
    enquiryId && enquiryId.length > 0
      ? await getUserEnquiryById({
          supabase,
          userId: user.id,
          enquiryId,
        })
      : null;

  return (
    <AppShell userEmail={user.email ?? "staff@unknown"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          AI Client Enquiry Assistant
        </h1>
        <p className="mt-2 text-slate-600">
          Analyze client enquiries, classify intent, and generate suggested staff responses.
        </p>
      </div>

      <EnquiryWorkspace initialResult={selectedEnquiry} defaultModel={settings.defaultModel} />
    </AppShell>
  );
}
