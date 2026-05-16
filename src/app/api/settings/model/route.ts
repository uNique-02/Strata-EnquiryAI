import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJsonError } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { getOrCreateUserModelSettings } from "@/lib/services/enquiry-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

const updateSettingsSchema = z.object({
  defaultModel: z.string().trim().min(3).max(120),
  temperature: z.number().min(0).max(1.5),
  maxTokens: z.number().int().min(100).max(2000),
});

export async function GET() {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) return apiError("Unauthorized.", 401);

  const env = getServerEnv();
  const settings = await getOrCreateUserModelSettings({
    supabase,
    userId: user.id,
    envDefaultModel: env.openRouterDefaultModel,
  });

  return NextResponse.json(settings, { status: 200 });
}

export async function PATCH(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUserOrNull();
    if (!user) return apiError("Unauthorized.", 401);

    const parsed = updateSettingsSchema.parse(await request.json());

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          default_model: parsed.defaultModel,
          temperature: parsed.temperature,
          max_tokens: parsed.maxTokens,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error || !data) {
      return apiError(error?.message ?? "Unable to update settings.", 500);
    }

    return NextResponse.json(
      {
        defaultModel: data.default_model,
        temperature: data.temperature,
        maxTokens: data.max_tokens,
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError(parseJsonError(error), 400);
  }
}

