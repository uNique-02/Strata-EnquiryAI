import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJsonError } from "@/lib/api";
import { getAuthenticatedUserOrNull } from "@/lib/supabase/auth";

const createKeySchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
});

const revokeKeySchema = z.object({
  keyId: z.string().uuid(),
});

function generatePublicApiKey() {
  return `strata_pk_${randomBytes(24).toString("hex")}`;
}

export async function GET() {
  const { user, supabase } = await getAuthenticatedUserOrNull();
  if (!user) return apiError("Unauthorized.", 401);

  const { data, error } = await supabase
    .from("public_api_keys")
    .select("id,label,api_key,revoked_at,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return apiError(error.message, 500);

  return NextResponse.json({ keys: data ?? [] }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUserOrNull();
    if (!user) return apiError("Unauthorized.", 401);

    const body = createKeySchema.parse(await request.json().catch(() => ({})));
    const label = body.label && body.label.length > 0 ? body.label : "API Key";

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const apiKey = generatePublicApiKey();
      const { data, error } = await supabase
        .from("public_api_keys")
        .insert({
          user_id: user.id,
          label,
          api_key: apiKey,
        })
        .select("id,label,api_key,revoked_at,created_at,updated_at")
        .single();

      if (error) {
        const duplicate = error.message.toLowerCase().includes("duplicate");
        if (duplicate && attempt < 4) continue;
        return apiError(error.message, 500);
      }

      return NextResponse.json({ key: data }, { status: 201 });
    }

    return apiError("Unable to generate API key. Please retry.", 500);
  } catch (error) {
    return apiError(parseJsonError(error), 400);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUserOrNull();
    if (!user) return apiError("Unauthorized.", 401);

    const body = revokeKeySchema.parse(await request.json());

    const { data, error } = await supabase
      .from("public_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", body.keyId)
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .select("id,label,api_key,revoked_at,created_at,updated_at")
      .maybeSingle();

    if (error) return apiError(error.message, 500);
    if (!data) return apiError("API key not found or already revoked.", 404);

    return NextResponse.json({ key: data }, { status: 200 });
  } catch (error) {
    return apiError(parseJsonError(error), 400);
  }
}

