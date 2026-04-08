/**
 * RuangTeduh — Supabase Server Client
 *
 * Use this in Server Components, Route Handlers, and Server Actions.
 * Reads/writes cookies via next/headers so the session is correctly
 * shared between SSR and the browser.
 *
 * Usage:
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY tersedia."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookie writes are ignored.
            // The middleware handles session refresh instead.
          }
        },
      },
    }
  );
}
