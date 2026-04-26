import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";

export const isSupabaseConfigured = Boolean(url && anon);

// Create a real client when env vars exist; otherwise create a harmless stub
// pointed at a placeholder host so the app boots and we can show friendly errors.
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "aa-proof-auth",
    },
  },
);

export const PROOF_BUCKET = "proof-uploads";
export const PROOF_TABLE = "proof_submissions";
