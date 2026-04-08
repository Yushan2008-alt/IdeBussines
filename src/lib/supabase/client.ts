/**
 * RuangTeduh — Supabase Browser Client
 *
 * Use this in "use client" components and pages.
 * Uses @supabase/ssr's createBrowserClient so cookies are
 * automatically synced with the server session.
 *
 * Usage:
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY tersedia."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
