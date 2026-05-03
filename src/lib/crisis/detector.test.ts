import { describe, it, expect } from 'vitest';
import { detectCrisis } from './detector';

describe('detectCrisis — HIGH severity', () => {
  it('detects "bunuh diri"', () => {
    const r = detectCrisis('aku mau bunuh diri besok');
    expect(r.severity).toBe('high');
    expect(r.matchedKeywords).toContain('bunuh diri');
    expect(r.recommendedAction).toBe('show_crisis_screen');
  });

  it('detects "bundir" slang', () => {
    expect(detectCrisis('udah ga tahan, mau bundir aja').severity).toBe('high');
  });

  it('detects "kms" slang', () => {
    expect(detectCrisis('kms aja deh').severity).toBe('high');
  });

  it('detects mixed case', () => {
    expect(detectCrisis('AKU MAU BUNUH DIRI').severity).toBe('high');
  });
});

describe('detectCrisis — MEDIUM severity', () => {
  it('detects "pengen mati"', () => {
    const r = detectCrisis('aku pengen mati aja rasanya');
    expect(r.severity).toBe('medium');
    expect(r.recommendedAction).toBe('show_crisis_banner');
  });

  it('detects "ga mau hidup"', () => {
    expect(detectCrisis('ga mau hidup lagi').severity).toBe('medium');
  });
});

describe('detectCrisis — LOW severity', () => {
  it('detects "capek hidup"', () => {
    const r = detectCrisis('capek hidup, semua terasa berat');
    expect(r.severity).toBe('low');
    expect(r.recommendedAction).toBe('suggest_breathing_safety');
  });

  it('detects "putus asa"', () => {
    expect(detectCrisis('aku putus asa banget hari ini').severity).toBe('low');
  });
});

describe('detectCrisis — no match', () => {
  it('returns null for normal text', () => {
    const r = detectCrisis('hari ini aku jalan-jalan ke mall');
    expect(r.severity).toBe(null);
    expect(r.recommendedAction).toBe('continue_normal');
  });

  it('returns null for empty input', () => {
    expect(detectCrisis('').severity).toBe(null);
  });

  it('returns null for whitespace only', () => {
    expect(detectCrisis('   ').severity).toBe(null);
  });
});

describe('detectCrisis — severity precedence', () => {
  it('returns HIGH when both high and medium match', () => {
    const r = detectCrisis('aku pengen mati, mau bunuh diri');
    expect(r.severity).toBe('high');
  });
});
