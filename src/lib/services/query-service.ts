import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type DBClient = SupabaseClient<Database>;

export async function listUserEnquiries(args: {
  supabase: DBClient;
  userId: string;
  limit?: number;
}) {
  const { data, error } = await args.supabase
    .from("enquiries")
    .select("*")
    .eq("user_id", args.userId)
    .order("created_at", { ascending: false })
    .limit(args.limit ?? 50);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUserEnquiryById(args: {
  supabase: DBClient;
  userId: string;
  enquiryId: string;
}) {
  const { data, error } = await args.supabase
    .from("enquiries")
    .select("*")
    .eq("user_id", args.userId)
    .eq("id", args.enquiryId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

