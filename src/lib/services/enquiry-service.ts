import type { SupabaseClient } from "@supabase/supabase-js";
import { ENQUIRY_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";
import { requestOpenRouterCompletion } from "@/lib/ai/openrouter";
import {
  MANUAL_REVIEW_THRESHOLD,
  PROMPT_VERSION,
  type Classification,
  type Urgency,
} from "@/lib/constants";
import type { Database, Json } from "@/lib/database.types";
import {
  aiResponseSchema,
  analyzeRequestSchema,
  fallbackAiResponse,
  normalizeOptionalString,
  parseAiJson,
  sanitizeAiResponse,
} from "@/lib/validation";

type DBClient = SupabaseClient<Database>;

export interface AnalyzeEnquiryInput {
  clientName?: string;
  clientEmail?: string;
  enquiryText: string;
  modelOverride?: string;
}

export interface UserModelSettings {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}

export async function analyzeAndSaveEnquiry(args: {
  supabase: DBClient;
  userId: string;
  input: AnalyzeEnquiryInput;
  settings: UserModelSettings;
}) {
  const validatedInput = analyzeRequestSchema.parse(args.input);
  const clientName = normalizeOptionalString(validatedInput.clientName);
  const clientEmail = normalizeOptionalString(validatedInput.clientEmail);
  const modelToUse =
    normalizeOptionalString(validatedInput.modelOverride) ?? args.settings.defaultModel;

  let aiPayload: unknown = null;
  let parsedAnalysis = fallbackAiResponse(validatedInput.enquiryText);

  try {
    const completion = await requestOpenRouterCompletion({
      model: modelToUse,
      systemPrompt: ENQUIRY_SYSTEM_PROMPT,
      userPrompt: buildUserPrompt({
        clientName,
        clientEmail,
        enquiryText: validatedInput.enquiryText,
      }),
      temperature: args.settings.temperature,
      maxTokens: args.settings.maxTokens,
    });

    aiPayload = completion.raw;
    const parsedJson = parseAiJson(completion.content);
    const validatedAi = aiResponseSchema.parse(parsedJson);
    parsedAnalysis = sanitizeAiResponse(validatedAi);
  } catch {
    parsedAnalysis = fallbackAiResponse(validatedInput.enquiryText);
  }

  const manualReview = parsedAnalysis.confidence < MANUAL_REVIEW_THRESHOLD;

  const recordToInsert: Database["public"]["Tables"]["enquiries"]["Insert"] = {
    user_id: args.userId,
    client_name: clientName,
    client_email: clientEmail,
    enquiry_text: validatedInput.enquiryText,
    classification: parsedAnalysis.classification,
    confidence: parsedAnalysis.confidence,
    urgency: parsedAnalysis.urgency,
    summary: parsedAnalysis.summary,
    recommended_action: parsedAnalysis.recommended_action,
    suggested_response: parsedAnalysis.suggested_response,
    manual_review: manualReview,
    model_used: modelToUse,
    prompt_version: PROMPT_VERSION,
    raw_ai_json: aiPayload as Json,
  };

  const { data, error } = await args.supabase
    .from("enquiries")
    .insert(recordToInsert)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to persist enquiry analysis.");
  }

  return {
    ...data,
    classification: data.classification as Classification,
    urgency: data.urgency as Urgency,
  };
}

export async function getOrCreateUserModelSettings(args: {
  supabase: DBClient;
  userId: string;
  envDefaultModel: string;
}) {
  const { data, error } = await args.supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", args.userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return {
      defaultModel: data.default_model,
      temperature: data.temperature,
      maxTokens: data.max_tokens,
    };
  }

  const { data: inserted, error: insertError } = await args.supabase
    .from("user_settings")
    .insert({
      user_id: args.userId,
      default_model: args.envDefaultModel,
      temperature: 0.2,
      max_tokens: 650,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? "Unable to create default user settings.");
  }

  return {
    defaultModel: inserted.default_model,
    temperature: inserted.temperature,
    maxTokens: inserted.max_tokens,
  };
}

