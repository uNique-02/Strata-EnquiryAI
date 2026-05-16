import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EnquiryHistoryList } from "@/components/enquiry-history-list";
import { listUserEnquiries } from "@/lib/services/query-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) {
    redirect("/auth/login");
  }

  const enquiries = await listUserEnquiries({
    supabase,
    userId: user.id,
    limit: 60,
  });

  return (
    <AppShell userEmail={user.email ?? "staff@unknown"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Enquiry Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Review prior enquiry cards. Click any card to reopen the full AI analysis on the main assistant page.
        </p>
      </div>

      <EnquiryHistoryList enquiries={enquiries} />
    </AppShell>
  );
}

