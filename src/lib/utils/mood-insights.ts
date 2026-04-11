/**
 * RuangTeduh — Mood Insights Utilities (v2)
 *
 * Key changes from v1:
 *  - date-fns for timezone-safe local date operations
 *  - Calendar week (Mon–Sun) alongside rolling-7 window
 *  - Enhanced DayMoodStat: count, isPast, dominantLabel, color, fullDayLabel
 *  - CalendarWeekStats extends WeeklyStats (compatible drop-in)
 *  - groupByLocalDate() exported helper for any consumer
 *
 * Design tokens (from globals.css):
 *   kewalahan → #A591CC  sedih → #55A8C9  biasa → #8FAF94
 *   tenang → #5A7D61    damai → #E8AA84
 */

import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isBefore,
  startOfDay,
} from "date-fns";
import type { MoodId } from "@/types/supabase";

/* ─── Mood metadata ─────────────────────────────────────── */

export const MOOD_SCORE: Record<MoodId, number> = {
  kewalahan: 1,
  sedih:     2,
  biasa:     3,
  tenang:    4,
  damai:     5,
};

export const MOOD_LABEL: Record<MoodId, string> = {
  kewalahan: "Kewalahan",
  sedih:     "Sedih",
  biasa:     "Biasa Saja",
  tenang:    "Tenang",
  damai:     "Damai",
};

export const MOOD_EMOJI: Record<MoodId, string> = {
  kewalahan: "😰",
  sedih:     "😢",
  biasa:     "😐",
  tenang:    "😌",
  damai:     "😊",
};

/** Chart fill/bar color per mood. */
export const MOOD_COLOR: Record<MoodId, string> = {
  kewalahan: "#A591CC",
  sedih:     "#55A8C9",
  biasa:     "#8FAF94",
  tenang:    "#5A7D61",
  damai:     "#E8AA84",
};

/* ─── Day-name arrays (Sunday = index 0, JS native) ────── */
const ID_DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const ID_DAY_FULL  = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/* ─── Data shapes ───────────────────────────────────────── */

/** Per-day aggregated data used by both AreaChart and ComposedChart. */
export interface DayMoodStat {
  /** Local calendar date string: YYYY-MM-DD */
  date:           string;
  /** Short day label: "Sen", "Sel", … */
  dayLabel:       string;
  /** Full day label: "Senin", "Selasa", … */
  fullDayLabel:   string;
  /** Mode mood for the day (null = no entries). */
  mood:           MoodId | null;
  /** Numeric score 1–5 for the Line chart (null = no entries). */
  score:          number | null;
  /** Total number of mood entries logged that day (for Bar height). */
  count:          number;
  /** Hex fill color — dominant mood color, or a muted grey if no entries. */
  color:          string;
  /** True when the full calendar day has passed (before start of today). */
  isPast:         boolean;
  /** Displayed below X-axis for past days: "Dominan: Tenang". Null if no data or not past. */
  dominantLabel:  string | null;
}

export type TrendDirection =
  | "improving"
  | "declining"
  | "stable"
  | "mixed"
  | "insufficient";

export interface WeeklyStats {
  /** 7 DayMoodStat entries ordered oldest → newest. */
  days:          DayMoodStat[];
  overallMood:   MoodId | null;
  overallLabel:  string;
  trend:         TrendDirection;
  insight:       string;
  totalEntries:  number;
}

/** WeeklyStats anchored to the current ISO calendar week (Mon–Sun). */
export interface CalendarWeekStats extends WeeklyStats {
  /** Monday of the current week — YYYY-MM-DD */
  weekStart: string;
  /** Sunday of the current week — YYYY-MM-DD */
  weekEnd:   string;
}

/* ─── Timezone-safe helpers ─────────────────────────────── */

/**
 * Convert any date to a YYYY-MM-DD string in **local** timezone.
 * Uses date-fns `format` so results match the user's wall clock.
 */
export function toLocalDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/**
 * Parse a Supabase ISO timestamp (UTC) and return YYYY-MM-DD in local tz.
 * Handles both `2024-01-15T14:30:00+00:00` and `2024-01-15T14:30:00Z`.
 */
function isoToLocalDate(isoStr: string): string {
  return format(parseISO(isoStr), "yyyy-MM-dd");
}

/**
 * Group raw mood_entries rows by their **local calendar date**.
 *
 * @param entries  Array of { mood_id, created_at } rows from Supabase.
 * @returns        Map of YYYY-MM-DD → MoodId[]
 */
export function groupByLocalDate(
  entries: { mood_id: MoodId; created_at: string }[],
): Record<string, MoodId[]> {
  const result: Record<string, MoodId[]> = {};
  for (const entry of entries) {
    const date = isoToLocalDate(entry.created_at);
    if (!result[date]) result[date] = [];
    result[date].push(entry.mood_id);
  }
  return result;
}

/* ─── Core aggregation helpers ──────────────────────────── */

/**
 * Return the mode (most frequent) MoodId in an array.
 * Tie-break: prefer the **higher score** (calmer mood wins).
 */
export function getMoodMode(moods: MoodId[]): MoodId | null {
  if (moods.length === 0) return null;

  const freq: Partial<Record<MoodId, number>> = {};
  for (const m of moods) freq[m] = (freq[m] ?? 0) + 1;

  let best: MoodId = moods[0];
  for (const [mood, count] of Object.entries(freq) as [MoodId, number][]) {
    const bestCount = freq[best] ?? 0;
    if (
      count > bestCount ||
      (count === bestCount && MOOD_SCORE[mood] > MOOD_SCORE[best])
    ) {
      best = mood;
    }
  }
  return best;
}

/**
 * Determine the trend direction across a week of DayMoodStat entries.
 * Only days with at least one entry are considered.
 *
 * Algorithm:
 *  – < 3 days with data → "insufficient"
 *  – Split scored days into first half / second half; compare averages
 *  – Variance < 0.5 across all days → "stable"
 *  – diff > +0.6 → "improving" | diff < –0.6 → "declining" | else "mixed"
 */
export function analyzeTrend(days: DayMoodStat[]): TrendDirection {
  const scored = days.filter((d) => d.score !== null) as (DayMoodStat & {
    score: number;
  })[];
  if (scored.length < 3) return "insufficient";

  const mid        = Math.ceil(scored.length / 2);
  const firstHalf  = scored.slice(0, mid);
  const secondHalf = scored.slice(mid);

  const avg = (arr: { score: number }[]) =>
    arr.reduce((s, d) => s + d.score, 0) / arr.length;

  const diff     = avg(secondHalf) - avg(firstHalf);
  const allScores = scored.map((d) => d.score);
  const mean      = allScores.reduce((s, v) => s + v, 0) / allScores.length;
  const variance  =
    allScores.reduce((s, v) => s + (v - mean) ** 2, 0) / allScores.length;

  if (variance < 0.5) return "stable";
  if (diff > 0.6)     return "improving";
  if (diff < -0.6)    return "declining";
  return "mixed";
}

/**
 * Generate a rule-based, empathetic insight in Bahasa Indonesia.
 * Used both by `buildWeeklyStats` (AreaChart) and `buildCalendarWeekStats` (ComposedChart).
 */
export function generateInsight(
  overallMood: MoodId | null,
  trend: TrendDirection,
  totalEntries: number,
): string {
  if (totalEntries === 0) {
    return "Belum ada data mood minggu ini. Mulai catat perasaanmu — sekecil apapun itu, setiap catatan adalah langkah keberanian. 🌱";
  }
  if (trend === "insufficient") {
    return "Kamu sudah mulai mencatat perasaanmu — itu langkah yang berani! Coba catat setiap hari agar kamu bisa melihat pola mood-mu dengan lebih jelas. 💙";
  }
  if (overallMood === "kewalahan") {
    return "Kamu tampak kewalahan minggu ini. Ambil napas dalam — kamu tidak perlu menyelesaikan semuanya sekarang. Satu langkah kecil sudah cukup. 🌬️";
  }
  if (overallMood === "damai") {
    return "Kamu tampak damai dan bahagia minggu ini — sungguh menyenangkan melihat itu! Bagikan energi positifmu, barangkali seseorang di sekitarmu membutuhkannya. 🌟";
  }

  const trendMap: Record<TrendDirection, string> = {
    improving: overallMood && MOOD_SCORE[overallMood] >= 4
      ? "Perasaanmu semakin membaik sepanjang minggu ini — kamu melakukan hal yang luar biasa! Pertahankan rutinitas yang membuatmu merasa damai. 🌟"
      : "Ada peningkatan dalam mood-mu minggu ini! Meski perjalanan belum selesai, kamu sudah melangkah ke arah yang lebih cerah. ✨",
    declining: overallMood && MOOD_SCORE[overallMood] <= 2
      ? "Minggu ini terasa berat untukmu — dan itu wajar. Ingat bahwa mencari bantuan adalah tanda kekuatan, bukan kelemahan. Kamu tidak harus melewatinya sendirian. 💜"
      : "Mood-mu menurun sedikit belakangan ini. Cobalah satu langkah kecil hari ini — seperti berjalan keluar atau menghubungi seseorang yang kamu percaya. 🌿",
    stable: overallMood && MOOD_SCORE[overallMood] >= 3
      ? "Mood-mu sangat stabil minggu ini — konsistensi seperti ini adalah fondasi kesehatan mental yang kuat. Terus jaga keseimbanganmu. 🍃"
      : "Perasaanmu cukup stabil minggu ini. Stabilitas adalah kekuatan tersendiri — tapi jangan ragu untuk mencari hal-hal kecil yang bisa membawa senyum. 🌸",
    mixed:
      "Mood-mu bervariasi minggu ini — dan itu sangat manusiawi. Coba perhatikan apa yang terjadi di hari-hari yang lebih berat, mungkin ada pola yang bisa kamu kenali. 🔍",
    insufficient: "",
  };

  return trendMap[trend];
}

/* ─── buildDayMoodStat ───────────────────────────────────── */

/** Internal helper — builds a single DayMoodStat for a given date. */
function buildDayStat(
  day: Date,
  moodsForDay: MoodId[],
  today: Date,
): DayMoodStat {
  const date     = toLocalDate(day);
  const mode     = getMoodMode(moodsForDay);
  const isPast   = isBefore(day, startOfDay(today));
  const color    = mode ? MOOD_COLOR[mode] : "#E2EDE3";

  return {
    date,
    dayLabel:      ID_DAY_SHORT[day.getDay()],
    fullDayLabel:  ID_DAY_FULL[day.getDay()],
    mood:          mode,
    score:         mode ? MOOD_SCORE[mode] : null,
    count:         moodsForDay.length,
    color,
    isPast,
    dominantLabel: isPast && mode ? `Dominan: ${MOOD_LABEL[mode]}` : null,
  };
}

/* ─── Rolling-7 window (backward compat) ───────────────── */

/**
 * Build WeeklyStats from raw mood_entries rows using a **rolling 7-day** window
 * (6 days ago → today).  Compatible with existing AreaChart component.
 */
export function buildWeeklyStats(
  entries: { mood_id: MoodId; created_at: string }[],
  today: Date = new Date(),
): WeeklyStats {
  const byDate = groupByLocalDate(entries);

  const days: DayMoodStat[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return buildDayStat(d, byDate[toLocalDate(d)] ?? [], today);
  });

  const allMoods    = days.flatMap((d) => byDate[d.date] ?? []);
  const overallMood = getMoodMode(allMoods);
  const trend       = analyzeTrend(days);

  return {
    days,
    overallMood,
    overallLabel: overallMood
      ? `${MOOD_EMOJI[overallMood]} ${MOOD_LABEL[overallMood]}`
      : "Belum ada data",
    trend,
    insight:     generateInsight(overallMood, trend, allMoods.length),
    totalEntries: allMoods.length,
  };
}

/* ─── Calendar-week window (Mon–Sun) ───────────────────── */

/**
 * Build CalendarWeekStats from raw mood_entries rows using the **current ISO
 * calendar week** (Monday → Sunday).  Used by MoodCalendarChart (ComposedChart).
 *
 * Calendar mapping is timezone-aware via date-fns:
 *  – If today is Tuesday in WIB (UTC+7), Monday's slot is yesterday.
 *  – Entries timestamped 23:59 WIB on Monday map to Monday's slot, not Tuesday's.
 */
export function buildCalendarWeekStats(
  entries: { mood_id: MoodId; created_at: string }[],
  today: Date = new Date(),
): CalendarWeekStats {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd   = endOfWeek(today, { weekStartsOn: 1 });   // Sunday
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const byDate = groupByLocalDate(entries);

  const days: DayMoodStat[] = daysOfWeek.map((day) =>
    buildDayStat(day, byDate[toLocalDate(day)] ?? [], today),
  );

  const allMoods    = days.flatMap((d) => byDate[d.date] ?? []);
  const overallMood = getMoodMode(allMoods);
  const trend       = analyzeTrend(days);

  return {
    days,
    overallMood,
    overallLabel: overallMood
      ? `${MOOD_EMOJI[overallMood]} ${MOOD_LABEL[overallMood]}`
      : "Belum ada data",
    trend,
    insight:      generateInsight(overallMood, trend, allMoods.length),
    totalEntries: allMoods.length,
    weekStart:    toLocalDate(weekStart),
    weekEnd:      toLocalDate(weekEnd),
  };
}
