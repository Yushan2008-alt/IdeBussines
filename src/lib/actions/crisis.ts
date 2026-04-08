"use server";

/**
 * RuangTeduh — Crisis Log Server Actions
 * Table: public.crisis_logs
 * Immutable audit log — only inserts, no updates or deletes.
 */

import { createClient } from "@/lib/supabase/server";

/* ─── Log a crisis modal open event ───────────────────── */
export async function logCrisisEvent(hotlineCalled: string) {
  const supabase = await createClient();

  // user may be anonymous / not logged in during a crisis
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("crisis_logs").insert({
    user_id:        user?.id ?? null,
    hotline_called: hotlineCalled,
    triggered_at:   new Date().toISOString(),
  });

  if (error) {
    // Non-fatal — never block the UI during a crisis event
    console.error("[logCrisisEvent] insert error:", error.message);
  }

  return { success: true };
}
