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
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_ENV_ERROR =
  "Supabase env belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY tersedia.";

function createMissingEnvProxy(): SupabaseClient {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        throw new Error(`${SUPABASE_ENV_ERROR} (akses properti: ${String(prop)})`);
      },
    },
  ) as SupabaseClient;
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    /*
     * During server prerender of client routes, this module can be evaluated
     * before browser env vars are available in the build environment.
     * Return a lazy proxy so the build can complete; real usage in browser
     * still throws the same explicit configuration error.
     */
    if (typeof window === "undefined") return createMissingEnvProxy();
    throw new Error(SUPABASE_ENV_ERROR);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
