import {
  CRISIS_KEYWORDS_HIGH,
  CRISIS_KEYWORDS_MEDIUM,
  CRISIS_KEYWORDS_LOW,
} from './keywords';

export type CrisisSeverity = 'low' | 'medium' | 'high' | null;

export interface CrisisDetection {
  severity: CrisisSeverity;
  matchedKeywords: string[];
  recommendedAction:
    | 'show_crisis_screen'        // high
    | 'show_crisis_banner'        // medium
    | 'suggest_breathing_safety'  // low
    | 'continue_normal';          // null
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function findMatches(text: string, dict: readonly string[]): string[] {
  const found: string[] = [];
  for (const kw of dict) {
    if (text.includes(kw)) found.push(kw);
  }
  return found;
}

/**
 * Scan free-text input for crisis signals. Returns highest-severity match.
 *
 * @param text — user input (any length)
 * @returns CrisisDetection with severity null if no match
 */
export function detectCrisis(text: string): CrisisDetection {
  if (!text || text.length === 0) {
    return { severity: null, matchedKeywords: [], recommendedAction: 'continue_normal' };
  }

  const normalized = normalize(text);

  const high = findMatches(normalized, CRISIS_KEYWORDS_HIGH);
  if (high.length > 0) {
    return {
      severity: 'high',
      matchedKeywords: high,
      recommendedAction: 'show_crisis_screen',
    };
  }

  const medium = findMatches(normalized, CRISIS_KEYWORDS_MEDIUM);
  if (medium.length > 0) {
    return {
      severity: 'medium',
      matchedKeywords: medium,
      recommendedAction: 'show_crisis_banner',
    };
  }

  const low = findMatches(normalized, CRISIS_KEYWORDS_LOW);
  if (low.length > 0) {
    return {
      severity: 'low',
      matchedKeywords: low,
      recommendedAction: 'suggest_breathing_safety',
    };
  }

  return { severity: null, matchedKeywords: [], recommendedAction: 'continue_normal' };
}
