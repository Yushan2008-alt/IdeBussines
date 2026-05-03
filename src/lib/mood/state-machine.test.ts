import { describe, it, expect } from 'vitest';
import {
  classifyMood,
  decidePostMoodRoute,
  isDistressPattern3Day,
  computeStreak,
} from './state-machine';

describe('classifyMood', () => {
  it('maps kewalahan → distress', () => {
    expect(classifyMood('kewalahan')).toBe('distress');
  });
  it('maps sedih → distress', () => {
    expect(classifyMood('sedih')).toBe('distress');
  });
  it('maps biasa → neutral', () => {
    expect(classifyMood('biasa')).toBe('neutral');
  });
  it('maps tenang → positive', () => {
    expect(classifyMood('tenang')).toBe('positive');
  });
  it('maps damai → positive', () => {
    expect(classifyMood('damai')).toBe('positive');
  });
});

describe('isDistressPattern3Day', () => {
  it('returns false for fewer than 3 entries', () => {
    expect(isDistressPattern3Day([])).toBe(false);
    expect(isDistressPattern3Day([{ emotion: 'sedih', created_at: '2026-04-01T10:00:00Z' }])).toBe(false);
  });

  it('returns true for 3 consecutive distress days', () => {
    const entries = [
      { emotion: 'kewalahan' as const, created_at: '2026-04-03T10:00:00Z' },
      { emotion: 'sedih' as const, created_at: '2026-04-02T10:00:00Z' },
      { emotion: 'sedih' as const, created_at: '2026-04-01T10:00:00Z' },
    ];
    expect(isDistressPattern3Day(entries)).toBe(true);
  });

  it('returns false if a gap day exists', () => {
    const entries = [
      { emotion: 'sedih' as const, created_at: '2026-04-04T10:00:00Z' },
      { emotion: 'sedih' as const, created_at: '2026-04-02T10:00:00Z' },
      { emotion: 'sedih' as const, created_at: '2026-04-01T10:00:00Z' },
    ];
    expect(isDistressPattern3Day(entries)).toBe(false);
  });

  it('returns false if any of last 3 days is non-distress', () => {
    const entries = [
      { emotion: 'biasa' as const, created_at: '2026-04-03T10:00:00Z' },
      { emotion: 'sedih' as const, created_at: '2026-04-02T10:00:00Z' },
      { emotion: 'sedih' as const, created_at: '2026-04-01T10:00:00Z' },
    ];
    expect(isDistressPattern3Day(entries)).toBe(false);
  });
});

describe('decidePostMoodRoute', () => {
  it('returns crisis_escalate on 3-day pattern', () => {
    const recent = [
      { emotion: 'kewalahan' as const, created_at: '2026-04-02T10:00:00Z' },
      { emotion: 'sedih' as const, created_at: '2026-04-01T10:00:00Z' },
    ];
    const result = decidePostMoodRoute('kewalahan', [
      { emotion: 'kewalahan', created_at: '2026-04-03T10:00:00Z' },
      ...recent,
    ]);
    expect(result.action).toBe('crisis_escalate');
    expect(result.showCrisisAlert).toBe(true);
  });

  it('returns breathing_then_bot for single-day distress', () => {
    const result = decidePostMoodRoute('sedih', [
      { emotion: 'sedih', created_at: '2026-04-03T10:00:00Z' },
    ]);
    expect(result.action).toBe('breathing_then_bot');
  });

  it('returns dashboard_nudge for neutral', () => {
    const result = decidePostMoodRoute('biasa', []);
    expect(result.action).toBe('dashboard_nudge');
  });

  it('returns celebration_share for positive', () => {
    const result = decidePostMoodRoute('damai', []);
    expect(result.action).toBe('celebration_share');
  });
});

describe('computeStreak', () => {
  it('starts streak at 1 for first checkin ever', () => {
    const r = computeStreak('2026-04-03', null, 0, 0);
    expect(r.newStreak).toBe(1);
    expect(r.newLongest).toBe(1);
    expect(r.isFirstCheckinToday).toBe(true);
  });

  it('increments streak for consecutive day', () => {
    const r = computeStreak('2026-04-03', '2026-04-02', 5, 5);
    expect(r.newStreak).toBe(6);
    expect(r.newLongest).toBe(6);
  });

  it('preserves streak in 2-day grace window', () => {
    const r = computeStreak('2026-04-03', '2026-04-01', 5, 5);
    expect(r.newStreak).toBe(5);
    expect(r.newLongest).toBe(5);
  });

  it('resets streak after 3+ day gap', () => {
    const r = computeStreak('2026-04-03', '2026-03-30', 10, 10);
    expect(r.newStreak).toBe(1);
    expect(r.newLongest).toBe(10);
  });

  it('returns no-op if same day', () => {
    const r = computeStreak('2026-04-03', '2026-04-03', 5, 5);
    expect(r.newStreak).toBe(5);
    expect(r.isFirstCheckinToday).toBe(false);
  });

  it('updates longest streak when new streak exceeds it', () => {
    const r = computeStreak('2026-04-03', '2026-04-02', 9, 9);
    expect(r.newLongest).toBe(10);
  });
});
