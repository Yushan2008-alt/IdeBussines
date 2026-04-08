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

// Fallback values prevent the SSR shell from crashing when .env.local
// is not configured. The client won't make real requests until real
// values are provided.
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://placeholder.supabase.co";
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
