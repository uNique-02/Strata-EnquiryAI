import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getUserEnquiryById } from "@/lib/services/query-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) return apiError("Unauthorized.", 401);

  const { id } = await context.params;

  const item = await getUserEnquiryById({
    supabase,
    userId: user.id,
    enquiryId: id,
  });

  if (!item) return apiError("Enquiry not found.", 404);

  return NextResponse.json(item, { status: 200 });
}

