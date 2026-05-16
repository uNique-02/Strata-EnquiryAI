interface ServerEnv {
  openRouterApiKey: string;
  openRouterDefaultModel: string;
  publicApiKey?: string;
  openRouterSiteUrl?: string;
  openRouterAppName?: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
}

let cachedServerEnv: ServerEnv | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = {
    openRouterApiKey: requiredEnv("OPENROUTER_API_KEY"),
    openRouterDefaultModel: requiredEnv("OPENROUTER_DEFAULT_MODEL"),
    publicApiKey: process.env.PUBLIC_API_KEY,
    openRouterSiteUrl: process.env.OPENROUTER_SITE_URL,
    openRouterAppName: process.env.OPENROUTER_APP_NAME,
    supabaseUrl: requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  return cachedServerEnv;
}

export function getPublicSupabaseEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}
