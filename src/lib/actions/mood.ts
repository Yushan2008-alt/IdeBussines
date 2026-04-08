"use server";

/**
 * RuangTeduh — Mood Entry Server Actions
 * Table: public.mood_entries
 */

import { createClient } from "@/lib/supabase/server";
import type { MoodId } from "@/types/supabase";

/* ─── Insert a new mood entry ──────────────────────────── */
export async function insertMoodEntry(moodId: MoodId, note?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Kamu harus login untuk menyimpan mood." };

  const { error } = await supabase.from("mood_entries").insert({
    user_id:    user.id,
    mood_id:    moodId,
    note:       note ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { success: true };
}

/* ─── Get recent mood entries (last 30 days) ────────────── */
export async function getMoodEntries(limit = 30) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Tidak terautentikasi." };

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

/* ─── Get mood streak (consecutive days with entry) ────── */
export async function getMoodStreak(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data } = await supabase
    .from("mood_entries")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  if (!data || data.length === 0) return 0;

  // Count consecutive days backwards from today
  const uniqueDays = [...new Set(
    data.map((r) => new Date(r.created_at).toDateString())
  )];

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (uniqueDays[i] === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
