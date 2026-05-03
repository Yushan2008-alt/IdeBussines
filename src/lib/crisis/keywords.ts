/**
 * Crisis keyword dictionary — Bahasa Indonesia + common slang.
 *
 * MAINTENANCE: To add a keyword:
 * 1. Discuss with team first (safety review)
 * 2. Add to correct severity tier
 * 3. Add unit test that matches it
 *
 * Severity tiers:
 *   HIGH    — Explicit intent / imminent harm signals
 *   MEDIUM  — Passive ideation / death wish
 *   LOW     — Severe distress / hopelessness without explicit ideation
 *
 * Keywords are matched as case-insensitive substrings on normalized text
 * (lowercase, multi-space collapsed). Word boundaries are NOT enforced because
 * Indonesian compound expressions and informal text rarely respect them.
 */

export const CRISIS_KEYWORDS_HIGH: readonly string[] = [
  // explicit suicide intent
  'bunuh diri',
  'bundir',
  'ngakhirin hidup',
  'akhiri hidup',
  'mengakhiri hidup',
  'mau mati sekarang',
  'siap mati',
  'rencana bunuh diri',

  // self-harm explicit
  'menyakiti diri',
  'lukai diri',
  'sayat tangan',
  'gantung diri',
  'overdosis',
  'minum racun',

  // english (common in IG/Twitter crossover)
  'kill myself',
  'kms',
  'end it all',
  'suicide',
];

export const CRISIS_KEYWORDS_MEDIUM: readonly string[] = [
  // passive ideation
  'mau mati',
  'pengen mati',
  'ingin mati',
  'lebih baik mati',
  'andai aku mati',
  'kalo aku mati',
  'kalau aku mati',

  // not wanting to live
  'ga mau hidup',
  'gak mau hidup',
  'tidak ingin hidup',
  'males hidup',
  'malas hidup',
  'ga ada gunanya hidup',
  'gak ada gunanya hidup',

  // self-harm passive
  'self harm',
  'selfharm',
  'menyakiti diri sendiri',
];

export const CRISIS_KEYWORDS_LOW: readonly string[] = [
  // severe hopelessness
  'capek hidup',
  'lelah hidup',
  'udah ga sanggup',
  'sudah tidak sanggup',
  'ga kuat lagi',
  'gak kuat lagi',
  'tidak kuat lagi',
  'putus asa',
  'ga ada harapan',
  'tidak ada harapan',
  'hidupku ga berarti',
  'hidupku tidak berarti',
  'udahan aja',
  'selesai aja',
  'menyerah',
  'give up',
];
