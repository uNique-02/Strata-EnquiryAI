import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { listUserEnquiries } from "@/lib/services/query-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) return apiError("Unauthorized.", 401);

  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Math.min(Math.max(Number(limitRaw), 1), 100) : 50;

  const results = await listUserEnquiries({
    supabase,
    userId: user.id,
    limit,
  });

  return NextResponse.json({ items: results }, { status: 200 });
}

