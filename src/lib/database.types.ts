export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      enquiries: {
        Row: {
          id: string;
          user_id: string;
          client_name: string | null;
          client_email: string | null;
          enquiry_text: string;
          classification: string;
          confidence: number;
          urgency: string;
          summary: string;
          recommended_action: string;
          suggested_response: string;
          manual_review: boolean;
          model_used: string;
          prompt_version: string;
          raw_ai_json: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_name?: string | null;
          client_email?: string | null;
          enquiry_text: string;
          classification: string;
          confidence: number;
          urgency: string;
          summary: string;
          recommended_action: string;
          suggested_response: string;
          manual_review?: boolean;
          model_used: string;
          prompt_version: string;
          raw_ai_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["enquiries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "enquiries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_settings: {
        Row: {
          user_id: string;
          default_model: string;
          temperature: number;
          max_tokens: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          default_model?: string;
          temperature?: number;
          max_tokens?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      public_api_keys: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          api_key: string;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          api_key: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["public_api_keys"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "public_api_keys_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
