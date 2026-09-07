import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function resolveEnvVar(...keys: string[]): string | undefined {
  for (const key of keys) {
    // Vite injects env vars with matching envPrefix at build/dev time via import.meta.env
    const metaEnv = typeof import.meta !== "undefined" ? (import.meta.env as Record<string, string | undefined>) : undefined;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
    // Node/SSR fallback via process.env (not available in browser at runtime)
    if (typeof process !== "undefined" && process.env[key]) return process.env[key];
  }
  return undefined;
}

const supabaseUrl = resolveEnvVar(
  "NEXT_PUBLIC_SUPABASE_URL",
  "VITE_SUPABASE_URL",
) || "https://placeholder.supabase.co";

const supabaseKey = resolveEnvVar(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
) || "placeholder-key";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient(supabaseUrl, supabaseKey);
  }
  return _client;
}

/** @deprecated Use getSupabaseClient() instead. Kept for backward compat. */
export const createClient = getSupabaseClient;
