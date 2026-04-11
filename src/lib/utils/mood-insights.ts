/**
 * RuangTeduh — Mood Insights Utilities
 * Pure functions for weekly mood statistics & AI-like rule-based insights.
 *
 * Design tokens used (from globals.css):
 *   kewalahan → lavender  #A591CC
 *   sedih      → sky      #55A8C9
 *   biasa      → sage     #8FAF94
 *   tenang     → sage-600 #5A7D61
 *   damai      → peach    #E8AA84
 */

import type { MoodId } from "@/types/supabase";

/* ─── Mood metadata ────────────────────────────────────────── */

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

/** Chart fill color per mood (used for dots & gradient). */
export const MOOD_COLOR: Record<MoodId, string> = {
  kewalahan: "#A591CC",
  sedih:     "#55A8C9",
  biasa:     "#8FAF94",
  tenang:    "#5A7D61",
  damai:     "#E8AA84",
};

/* ─── Data shapes ──────────────────────────────────────────── */

/** One day's aggregated mood data for the chart. */
export interface DayMoodStat {
  /** YYYY-MM-DD */
  date: string;
  /** Short weekday label in Indonesian: "Sen", "Sel", … */
  dayLabel: string;
  /** Mode mood for that day (null if no entries). */
  mood: MoodId | null;
  /** Numeric score (1-5) for chart Y-axis, null if no entries. */
  score: number | null;
  /** Total number of entries that day. */
  count: number;
}

export type TrendDirection = "improving" | "declining" | "stable" | "mixed" | "insufficient";

export interface WeeklyStats {
  /** 7 DayMoodStat entries, ordered oldest → newest. */
  days: DayMoodStat[];
  /** Mode mood across the whole week (null if no entries). */
  overallMood: MoodId | null;
  /** Human-readable overall mood label. */
  overallLabel: string;
  /** Trend direction. */
  trend: TrendDirection;
  /** Rule-based empathetic insight text (Bahasa Indonesia). */
  insight: string;
  /** Total entries recorded this week. */
  totalEntries: number;
}

/* ─── Helpers ──────────────────────────────────────────────── */

const ID_DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/** Get YYYY-MM-DD string for a Date in local timezone. */
export function toLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Given an array of MoodId values, return the mode (most frequent).
 * Tie-break: prefer the higher-score mood (i.e., calmer wins).
 */
export function getMoodMode(moods: MoodId[]): MoodId | null {
  if (moods.length === 0) return null;

  const freq: Partial<Record<MoodId, number>> = {};
  for (const m of moods) {
    freq[m] = (freq[m] ?? 0) + 1;
  }

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
 * Analyse the trend direction for a week.
 * Only considers days that have at least one entry.
 *
 * Algorithm:
 *   - If < 3 days with entries → "insufficient"
 *   - Split days-with-entries into first half and second half
 *   - Compare averages; threshold ±0.6
 *   - If scores are very consistent (variance < 0.5) → "stable"
 *   - Otherwise "improving" / "declining" / "mixed"
 */
export function analyzeTrend(days: DayMoodStat[]): TrendDirection {
  const scored = days.filter((d) => d.score !== null) as (DayMoodStat & { score: number })[];
  if (scored.length < 3) return "insufficient";

  const mid = Math.ceil(scored.length / 2);
  const firstHalf  = scored.slice(0, mid);
  const secondHalf = scored.slice(mid);

  const avg = (arr: { score: number }[]) =>
    arr.reduce((s, d) => s + d.score, 0) / arr.length;

  const firstAvg  = avg(firstHalf);
  const secondAvg = avg(secondHalf);
  const diff = secondAvg - firstAvg;

  // Check variance (how stable is the week overall?)
  const allScores = scored.map((d) => d.score);
  const mean = allScores.reduce((s, v) => s + v, 0) / allScores.length;
  const variance =
    allScores.reduce((s, v) => s + (v - mean) ** 2, 0) / allScores.length;

  if (variance < 0.5) return "stable";
  if (diff > 0.6)     return "improving";
  if (diff < -0.6)    return "declining";
  return "mixed";
}

/**
 * Generate a rule-based, empathetic insight text in Bahasa Indonesia
 * based on the overall mood and trend.
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

  // Trend-based insights
  const trendInsights: Record<TrendDirection, string> = {
    improving:
      overallMood && MOOD_SCORE[overallMood] >= 4
        ? "Perasaanmu semakin membaik sepanjang minggu ini — kamu melakukan hal yang luar biasa! Pertahankan rutinitas yang membuatmu merasa damai. 🌟"
        : "Ada peningkatan dalam mood-mu minggu ini! Meski perjalanan belum selesai, kamu sudah melangkah ke arah yang lebih cerah. ✨",
    declining:
      overallMood && MOOD_SCORE[overallMood] <= 2
        ? "Minggu ini terasa berat untukmu — dan itu wajar. Ingat bahwa mencari bantuan adalah tanda kekuatan, bukan kelemahan. Kamu tidak harus melewatinya sendirian. 💜"
        : "Mood-mu menurun sedikit belakangan ini. Cobalah satu langkah kecil hari ini — seperti berjalan keluar atau menghubungi seseorang yang kamu percaya. 🌿",
    stable:
      overallMood && MOOD_SCORE[overallMood] >= 3
        ? "Mood-mu sangat stabil minggu ini — konsistensi seperti ini adalah fondasi kesehatan mental yang kuat. Terus jaga keseimbanganmu. 🍃"
        : "Perasaanmu cukup stabil minggu ini. Stabilitas adalah kekuatan tersendiri — tapi jangan ragu untuk mencari hal-hal kecil yang bisa membawa senyum. 🌸",
    mixed:
      "Mood-mu bervariasi minggu ini — dan itu sangat manusiawi. Coba perhatikan apa yang terjadi di hari-hari yang lebih berat, mungkin ada pola yang bisa kamu kenali. 🔍",
    insufficient: "", // handled above
  };

  // Overlay mood-specific prefix for extreme moods
  if (overallMood === "kewalahan") {
    return `Kamu tampak kewalahan minggu ini. Ambil napas dalam — kamu tidak perlu menyelesaikan semuanya sekarang. Satu langkah kecil sudah cukup. 🌬️`;
  }
  if (overallMood === "damai") {
    return `Kamu tampak damai dan bahagia minggu ini — sungguh menyenangkan melihat itu! Bagikan energi positifmu, barangkali seseorang di sekitarmu membutuhkannya. 🌟`;
  }

  return trendInsights[trend];
}

/* ─── Main aggregator (pure, works on pre-fetched data) ─────── */

/**
 * Build WeeklyStats from raw mood_entries rows.
 * @param entries  Array of { mood_id, created_at } from Supabase
 * @param today    Optional override for "today" (useful in tests)
 */
export function buildWeeklyStats(
  entries: { mood_id: MoodId; created_at: string }[],
  today: Date = new Date(),
): WeeklyStats {
  // Build the 7-day window (oldest first, newest last)
  const days: DayMoodStat[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));   // 6 days ago … today
    const date = toLocalDate(d);
    return {
      date,
      dayLabel: ID_DAY_SHORT[d.getDay()],
      mood:  null,
      score: null,
      count: 0,
    };
  });

  // Group entries by local date
  const byDate: Record<string, MoodId[]> = {};
  for (const entry of entries) {
    const date = toLocalDate(new Date(entry.created_at));
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(entry.mood_id);
  }

  // Fill in per-day mode + score
  for (const day of days) {
    const moodsToday = byDate[day.date] ?? [];
    day.count = moodsToday.length;
    const mode = getMoodMode(moodsToday);
    if (mode) {
      day.mood  = mode;
      day.score = MOOD_SCORE[mode];
    }
  }

  // Overall mood — mode across all entries this week
  const allMoods = days.flatMap((d) => byDate[d.date] ?? []);
  const overallMood = getMoodMode(allMoods);
  const overallLabel = overallMood
    ? `${MOOD_EMOJI[overallMood]} ${MOOD_LABEL[overallMood]}`
    : "Belum ada data";

  const trend   = analyzeTrend(days);
  const insight = generateInsight(overallMood, trend, allMoods.length);

  return {
    days,
    overallMood,
    overallLabel,
    trend,
    insight,
    totalEntries: allMoods.length,
  };
}
