import type { MoodId } from "@/types/supabase";

type MoodThresholds = Record<Exclude<MoodId, "damai">, number>;

const MOOD_IDS: ReadonlyArray<MoodId> = ["kewalahan", "sedih", "biasa", "tenang", "damai"];
const RECENCY_WINDOW_DAYS = 7;

const DEFAULT_MOOD_SCORE_MAP: Record<MoodId, number> = {
  kewalahan: 1,
  sedih: 2.2,
  biasa: 3.4,
  tenang: 4.3,
  damai: 5,
};

const DEFAULT_WEEKLY_RECENCY_WEIGHT_BY_DAYS_AGO = [1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1];
const DEFAULT_TREND_SIGNIFICANT_DELTA = 0.6;

function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function parseJson(raw: string | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseMoodScoreMap(raw: string | undefined): Record<MoodId, number> {
  const parsed = parseJson(raw);
  if (!parsed || typeof parsed !== "object") return DEFAULT_MOOD_SCORE_MAP;

  const candidate = parsed as Partial<Record<MoodId, unknown>>;
  const nextMap: Partial<Record<MoodId, number>> = {};
  for (const moodId of MOOD_IDS) {
    const value = candidate[moodId];
    if (!isValidPositiveNumber(value)) return DEFAULT_MOOD_SCORE_MAP;
    nextMap[moodId] = value;
  }

  return nextMap as Record<MoodId, number>;
}

function parseRecencyWeights(raw: string | undefined): number[] {
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed) || parsed.length !== RECENCY_WINDOW_DAYS) {
    return DEFAULT_WEEKLY_RECENCY_WEIGHT_BY_DAYS_AGO;
  }

  const values = parsed.map((item) => {
    if (!isValidPositiveNumber(item)) return null;
    return item;
  });

  if (values.some((item) => item === null)) {
    return DEFAULT_WEEKLY_RECENCY_WEIGHT_BY_DAYS_AGO;
  }

  return values as number[];
}

function parseTrendSignificantDelta(raw: string | undefined): number {
  if (!raw) return DEFAULT_TREND_SIGNIFICANT_DELTA;
  const parsed = Number(raw);
  if (!isValidPositiveNumber(parsed)) return DEFAULT_TREND_SIGNIFICANT_DELTA;
  return parsed;
}

function buildMoodThresholds(scoreMap: Record<MoodId, number>): MoodThresholds {
  return {
    kewalahan: (scoreMap.kewalahan + scoreMap.sedih) / 2,
    sedih: (scoreMap.sedih + scoreMap.biasa) / 2,
    biasa: (scoreMap.biasa + scoreMap.tenang) / 2,
    tenang: (scoreMap.tenang + scoreMap.damai) / 2,
  };
}

export interface MoodScoringConfig {
  moodScoreMap: Record<MoodId, number>;
  moodThresholds: MoodThresholds;
  weeklyRecencyWeightByDaysAgo: number[];
  trendSignificantDelta: number;
}

export function loadMoodScoringConfigFromEnv(): MoodScoringConfig {
  const moodScoreMap = parseMoodScoreMap(process.env.NEXT_PUBLIC_MOOD_SCORE_MAP);
  return {
    moodScoreMap,
    moodThresholds: buildMoodThresholds(moodScoreMap),
    weeklyRecencyWeightByDaysAgo: parseRecencyWeights(process.env.NEXT_PUBLIC_MOOD_WEEKLY_RECENCY_WEIGHTS),
    trendSignificantDelta: parseTrendSignificantDelta(process.env.NEXT_PUBLIC_MOOD_TREND_DELTA),
  };
}

export const moodScoringConfig = loadMoodScoringConfigFromEnv();
