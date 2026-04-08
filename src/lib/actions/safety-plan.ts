"use server";

/**
 * RuangTeduh — Safety Plan Server Actions
 * Table: public.safety_plans
 * One row per user — upsert pattern.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SafetyPlan } from "@/types/supabase";

/* ─── Get the current user's safety plan ──────────────── */
export async function getSafetyPlan(): Promise<SafetyPlan | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("safety_plans")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as SafetyPlan;
}

/* ─── Upsert the user's safety plan ───────────────────── */
export async function upsertSafetyPlan(plan: Omit<SafetyPlan, "id" | "user_id" | "updated_at">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Kamu harus login untuk menyimpan safety plan." };

  const { error } = await supabase.from("safety_plans").upsert(
    {
      user_id:      user.id,
      warningSigns: plan.warningSigns,
      coping:       plan.coping,
      contacts:     plan.contacts,
      updated_at:   new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
