import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <Sidebar userEmail={userEmail} />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}

