"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Clock3, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const links = [
  {
    href: "/",
    label: "Enquiry Assistant",
    icon: Bot,
  },
  {
    href: "/dashboard",
    label: "Enquiry History",
    icon: Clock3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className="w-full border-r border-slate-200 bg-white lg:w-72">
      <div className="border-b border-slate-200 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Strata Management
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Consultants</h1>
      </div>

      <nav className="space-y-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500">Signed in as</p>
        <p className="truncate text-sm font-medium text-slate-800">{userEmail}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

