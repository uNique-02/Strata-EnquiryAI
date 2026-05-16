import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getOrCreateUserModelSettings } from "@/lib/services/enquiry-service";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

function generatePublicApiKey() {
  return `strata_pk_${randomBytes(24).toString("hex")}`;
}

export async function GET() {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) return apiError("Unauthorized.", 401);

  const settings = await getOrCreateUserModelSettings({
    supabase,
    userId: user.id,
    envDefaultModel: process.env.OPENROUTER_DEFAULT_MODEL ?? "openai/gpt-4o-mini",
  });

  return NextResponse.json(
    {
      publicApiKey: settings.publicApiKey ?? null,
    },
    { status: 200 },
  );
}

export async function PATCH() {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) return apiError("Unauthorized.", 401);

  // Ensure settings row exists before rotating key.
  await getOrCreateUserModelSettings({
    supabase,
    userId: user.id,
    envDefaultModel: process.env.OPENROUTER_DEFAULT_MODEL ?? "openai/gpt-4o-mini",
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const newKey = generatePublicApiKey();
    const { data, error } = await supabase
      .from("user_settings")
      .update({ public_api_key: newKey })
      .eq("user_id", user.id)
      .select("public_api_key")
      .single();

    if (error) {
      const duplicateKey = error.message.toLowerCase().includes("duplicate");
      if (duplicateKey && attempt < 4) {
        continue;
      }
      return apiError(error.message, 500);
    }

    return NextResponse.json({ publicApiKey: data.public_api_key }, { status: 200 });
  }

  return apiError("Unable to generate API key. Please retry.", 500);
}

