import { NextResponse } from "next/server";
import { apiError, parseJsonError } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import {
  analyzeAndSaveEnquiry,
  getOrCreateUserModelSettings,
} from "@/lib/services/enquiry-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUserOrNull();
    if (!user) return apiError("Unauthorized.", 401);

    const body = await request.json();
    const env = getServerEnv();
    const settings = await getOrCreateUserModelSettings({
      supabase,
      userId: user.id,
      envDefaultModel: env.openRouterDefaultModel,
    });

    const result = await analyzeAndSaveEnquiry({
      supabase,
      userId: user.id,
      input: {
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        enquiryText: body.enquiryText,
        modelOverride: body.modelOverride,
      },
      settings,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return apiError(parseJsonError(error), 400);
  }
}

