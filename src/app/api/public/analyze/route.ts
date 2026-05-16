import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJsonError } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { analyzeEnquiry } from "@/lib/services/enquiry-service";
import { analyzeRequestSchema } from "@/lib/validation";

const publicAnalyzeRequestSchema = analyzeRequestSchema.extend({
  temperature: z.number().min(0).max(1.5).optional(),
  maxTokens: z.number().int().min(100).max(2000).optional(),
});

function extractApiKey(request: Request) {
  const headerKey = request.headers.get("x-api-key");
  if (headerKey && headerKey.trim().length > 0) {
    return headerKey.trim();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim();
}

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    if (!env.publicApiKey) {
      return apiError("Public API is not configured.", 503);
    }

    const incomingKey = extractApiKey(request);
    if (!incomingKey || incomingKey !== env.publicApiKey) {
      return apiError("Unauthorized.", 401);
    }

    const body = publicAnalyzeRequestSchema.parse(await request.json());
    const analysis = await analyzeEnquiry({
      enquiry: {
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        enquiryText: body.enquiryText,
        modelOverride: body.modelOverride,
      },
      settings: {
        defaultModel: env.openRouterDefaultModel,
        temperature: body.temperature ?? 0.2,
        maxTokens: body.maxTokens ?? 650,
      },
    });

    return NextResponse.json(
      {
        ...analysis,
        source: "public_api",
      },
      { status: 200 },
    );
  } catch (error) {
    return apiError(parseJsonError(error), 400);
  }
}

