import { differenceInDays, parseISO } from 'date-fns';

// ----- Domain Types -----

export type MoodEmotion = 'kewalahan' | 'sedih' | 'biasa' | 'tenang' | 'damai';

export type MoodState = 'distress' | 'neutral' | 'positive';

export type NextAction =
  | 'breathing_then_bot'  // distress: forced breathing → bot with mood context
  | 'dashboard_nudge'     // neutral: dashboard with daily challenge
  | 'celebration_share'   // positive: streak celebration + share CTA
  | 'crisis_escalate';    // 3-day distress pattern → SOS proactive

export interface MoodEntry {
  emotion: MoodEmotion;
  created_at: string; // ISO UTC
}

export interface RouteDecision {
  state: MoodState;
  action: NextAction;
  showCrisisAlert: boolean;
  reason: string; // for analytics + debugging
}

// ----- Pure Classifier -----

const STATE_MAP: Record<MoodEmotion, MoodState> = {
  kewalahan: 'distress',
  sedih: 'distress',
  biasa: 'neutral',
  tenang: 'positive',
  damai: 'positive',
};

export function classifyMood(emotion: MoodEmotion): MoodState {
  return STATE_MAP[emotion];
}

// ----- Pattern Detection -----

/**
 * Returns true if user has 3+ consecutive days of distress mood.
 * `recent` MUST be sorted by created_at DESC and contain entries from last 7 days only.
 */
export function isDistressPattern3Day(recent: MoodEntry[]): boolean {
  if (recent.length < 3) return false;

  // Take latest entry per day (Asia/Jakarta day boundary already handled upstream)
  const byDay = new Map<string, MoodEmotion>();
  for (const entry of recent) {
    const day = entry.created_at.slice(0, 10); // YYYY-MM-DD
    if (!byDay.has(day)) byDay.set(day, entry.emotion);
  }

  const days = Array.from(byDay.keys()).sort().reverse(); // newest first
  if (days.length < 3) return false;

  // Last 3 days must all be distress AND consecutive (no gaps)
  const today = parseISO(days[0]);
  for (let i = 0; i < 3; i++) {
    if (i >= days.length) return false;
    const day = parseISO(days[i]);
    if (differenceInDays(today, day) !== i) return false;
    const emotion = byDay.get(days[i])!;
    if (classifyMood(emotion) !== 'distress') return false;
  }
  return true;
}

// ----- Main Decision Function -----

/**
 * Given current emotion + recent history, return what to do next.
 * This is the core router for post-mood action.
 */
export function decidePostMoodRoute(
  emotion: MoodEmotion,
  recent: MoodEntry[]
): RouteDecision {
  const state = classifyMood(emotion);

  // Crisis pattern overrides everything
  if (state === 'distress' && isDistressPattern3Day(recent)) {
    return {
      state,
      action: 'crisis_escalate',
      showCrisisAlert: true,
      reason: '3-day consecutive distress pattern detected',
    };
  }

  switch (state) {
    case 'distress':
      return {
        state,
        action: 'breathing_then_bot',
        showCrisisAlert: false,
        reason: 'Single-day distress — breathing first, then empathic bot',
      };
    case 'neutral':
      return {
        state,
        action: 'dashboard_nudge',
        showCrisisAlert: false,
        reason: 'Neutral mood — gentle nudge with daily challenge',
      };
    case 'positive':
      return {
        state,
        action: 'celebration_share',
        showCrisisAlert: false,
        reason: 'Positive mood — celebrate streak, offer share',
      };
  }
}

// ----- Streak Calculation -----

export interface StreakUpdate {
  newStreak: number;
  newLongest: number;
  isFirstCheckinToday: boolean;
}

/**
 * Compute streak based on last_checkin_date and today's date.
 * Rules:
 *   - Same day → no change (already checked in today)
 *   - 1 day ago → increment streak (consecutive)
 *   - 2 days ago → grace window: streak preserved, no increment
 *   - 3+ days ago → streak resets to 1
 *   - null (first ever) → streak = 1
 *
 * `today` and `lastCheckin` are 'YYYY-MM-DD' strings (Asia/Jakarta date).
 */
export function computeStreak(
  todayDateStr: string,
  lastCheckinDateStr: string | null,
  currentStreak: number,
  longestStreak: number
): StreakUpdate {
  if (lastCheckinDateStr === todayDateStr) {
    return {
      newStreak: currentStreak,
      newLongest: longestStreak,
      isFirstCheckinToday: false,
    };
  }

  const today = parseISO(todayDateStr);
  const last = lastCheckinDateStr ? parseISO(lastCheckinDateStr) : null;
  const daysSince = last ? differenceInDays(today, last) : Infinity;

  let newStreak: number;
  if (daysSince === 1) newStreak = currentStreak + 1;
  else if (daysSince === 2) newStreak = currentStreak; // grace window
  else newStreak = 1; // reset

  return {
    newStreak,
    newLongest: Math.max(longestStreak, newStreak),
    isFirstCheckinToday: true,
  };
}
