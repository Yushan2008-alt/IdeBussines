"use server";

/**
 * RuangTeduh — Mood Entry Server Actions
 * Table: public.mood_entries
 */

import { createClient } from "@/lib/supabase/server";
import type { MoodId } from "@/types/supabase";
import {
  buildWeeklyStats,
  buildCalendarWeekStats,
  type WeeklyStats,
  type CalendarWeekStats,
} from "@/lib/utils/mood-insights";
import { endOfWeek, parseISO, startOfWeek } from "date-fns";

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

/* ─── Get weekly mood statistics (last 7 days) ─────────── */
export async function getWeeklyMoodStats(): Promise<{ data: WeeklyStats | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Tidak terautentikasi." };

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("mood_entries")
    .select("mood_id, created_at")
    .eq("user_id", user.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  const stats = buildWeeklyStats(
    (data ?? []) as { mood_id: MoodId; created_at: string }[],
  );

  return { data: stats, error: null };
}

/* ─── Get calendar-week mood statistics (Mon–Sun) ───────── */
/**
 * Fetches mood entries for the current ISO calendar week (Monday → Sunday)
 * and returns CalendarWeekStats for the ComposedChart & Gemini context.
 *
 * Timezone: Supabase stores in UTC.  We query from Monday 00:00 local →
 * Sunday 23:59 local by converting to UTC ISO strings.
 */
interface CalendarWeekRangeParams {
  /** ISO timestamp from client-local Monday 00:00 converted to UTC string */
  weekStartIso?: string;
  /** ISO timestamp from client-local Sunday 23:59 converted to UTC string */
  weekEndIso?: string;
  /** ISO timestamp representing "now" in client timezone context */
  nowIso?: string;
}

export async function getCalendarWeekStats(params?: CalendarWeekRangeParams): Promise<{
  data: CalendarWeekStats | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Tidak terautentikasi." };

  const now = params?.nowIso ? parseISO(params.nowIso) : new Date();
  const fallbackWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday 00:00 local
  const fallbackWeekEnd   = endOfWeek(now, { weekStartsOn: 1 });   // Sunday 23:59 local
  const weekStart = params?.weekStartIso ? parseISO(params.weekStartIso) : fallbackWeekStart;
  const weekEnd   = params?.weekEndIso ? parseISO(params.weekEndIso) : fallbackWeekEnd;

  const { data, error } = await supabase
    .from("mood_entries")
    .select("mood_id, created_at")
    .eq("user_id", user.id)
    .gte("created_at", weekStart.toISOString())
    .lte("created_at", weekEnd.toISOString())
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  const stats = buildCalendarWeekStats(
    (data ?? []) as { mood_id: MoodId; created_at: string }[],
    now,
  );

  return { data: stats, error: null };
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
