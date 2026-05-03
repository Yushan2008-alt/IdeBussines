"use server";

/**
 * RuangTeduh — Mood Entry Server Actions
 * Table: public.mood_entries
 */

import { createClient } from "@/lib/supabase/server";
import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";
import type { MoodId } from "@/types/supabase";
import {
  computeStreak,
  decidePostMoodRoute,
  type MoodEmotion,
  type RouteDecision,
} from "@/lib/mood/state-machine";
import {
  buildWeeklyStats,
  buildCalendarWeekStats,
  type WeeklyStats,
  type CalendarWeekStats,
} from "@/lib/utils/mood-insights";
import { endOfWeek, parseISO, startOfWeek } from "date-fns";

/* ─── submitMood ────────────────────────────────────────── */

const TZ = "Asia/Jakarta";

const SubmitMoodSchema = z.object({
  emotion: z.enum(["kewalahan", "sedih", "biasa", "tenang", "damai"]),
  note: z.string().max(500).optional(),
});

export interface SubmitMoodResult {
  success: boolean;
  decision?: RouteDecision;
  streak?: { current: number; longest: number; incrementedToday: boolean };
  error?: string;
}

/**
 * Submit a mood entry. Side effects:
 *   1. Insert into mood_entries
 *   2. Update mood_streaks
 *   3. Compute and return RouteDecision (for client-side navigation)
 *
 * Does NOT auto-create crisis_logs — that's a separate explicit action triggered
 * by the client after seeing the decision.
 */
export async function submitMood(input: unknown): Promise<SubmitMoodResult> {
  const parsed = SubmitMoodSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Input tidak valid" };
  }
  const { emotion, note } = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, error: "Unauthorized" };

  const userId = auth.user.id;
  const today = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");

  // 1. Insert mood entry (mood_id is the existing column name)
  const { error: insertErr } = await supabase
    .from("mood_entries")
    .insert({ user_id: userId, mood_id: emotion, note: note ?? null });
  if (insertErr) return { success: false, error: "Gagal menyimpan mood" };

  // 2. Fetch current streak + recent entries (last 7 days)
  const [streakRes, recentRes] = await Promise.all([
    supabase
      .from("mood_streaks")
      .select("current_streak, longest_streak, last_checkin_date")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("mood_entries")
      .select("mood_id, created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // 3. Compute streak
  const currentStreakRow = streakRes.data ?? {
    current_streak: 0,
    longest_streak: 0,
    last_checkin_date: null,
  };
  const streakUpdate = computeStreak(
    today,
    currentStreakRow.last_checkin_date,
    currentStreakRow.current_streak,
    currentStreakRow.longest_streak
  );

  // 4. Upsert streak (only if first checkin of the day)
  if (streakUpdate.isFirstCheckinToday) {
    await supabase.from("mood_streaks").upsert({
      user_id: userId,
      current_streak: streakUpdate.newStreak,
      longest_streak: streakUpdate.newLongest,
      last_checkin_date: today,
    });
  }

  // 5. Decide next route — map mood_id → emotion for state machine
  const recent = (recentRes.data ?? []).map((r) => ({
    emotion: r.mood_id as MoodEmotion,
    created_at: r.created_at,
  }));
  const decision = decidePostMoodRoute(emotion, recent);

  return {
    success: true,
    decision,
    streak: {
      current: streakUpdate.newStreak,
      longest: streakUpdate.newLongest,
      incrementedToday: streakUpdate.isFirstCheckinToday,
    },
  };
}

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
