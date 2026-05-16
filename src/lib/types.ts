import type { Database } from "@/lib/database.types";

export type EnquiryRow = Database["public"]["Tables"]["enquiries"]["Row"];
export type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];

export interface AnalyzeEnquiryRequestBody {
  clientName?: string;
  clientEmail?: string;
  enquiryText: string;
  modelOverride?: string;
}

