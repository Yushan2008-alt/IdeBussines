"use server";

/**
 * RuangTeduh — Gemini AI "Curhat" Server Actions
 *
 * Two exported functions:
 *  1. sendCurhatMessage()     — user sends a message; Gemini replies with context-aware advice
 *  2. generateOverallSummary() — auto-generates "Overall Mood Minggu Ini" on page load
 *
 * NOTE: The PRD lists Claude API (TeduhBot) as the primary AI companion.
 * Gemini is used here as a mood-data-aware "Advisor" — a complementary feature.
 *
 * Set GEMINI_API_KEY in .env.local (server-only, never exposed to browser).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CalendarWeekStats } from "@/lib/utils/mood-insights";
import { MOOD_LABEL, MOOD_EMOJI } from "@/lib/utils/mood-insights";

/* ─── Gemini client factory (lazy, avoids top-level throw) ─ */
function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature:      0.8,
      maxOutputTokens:  512,
      topP:             0.9,
    },
  });
}

/* ─── Mood context string builder ───────────────────────── */
function buildMoodContext(stats: CalendarWeekStats): string {
  const dayLines = stats.days
    .map((d) => {
      if (!d.mood) return `  ${d.fullDayLabel}: tidak ada catatan`;
      return `  ${d.fullDayLabel}: ${MOOD_EMOJI[d.mood]} ${MOOD_LABEL[d.mood]} (${d.count} kali)`;
    })
    .join("\n");

  return `
DATA MOOD PENGGUNA MINGGU INI (${stats.weekStart} s/d ${stats.weekEnd}):
${dayLines}
- Mood keseluruhan : ${stats.overallLabel}
- Tren             : ${stats.trend}
- Total entri      : ${stats.totalEntries} catatan
`.trim();
}

/* ─── System persona prompt ─────────────────────────────── */
const SYSTEM_PROMPT = `Kamu adalah Teduh Advisor, asisten kesehatan mental empatik di platform RuangTeduh.

KEPRIBADIANMU:
- Hangat, tidak menghakimi, penuh perhatian
- Berbicara seperti teman yang bisa dipercaya, bukan dokter
- Selalu fokus pada solusi praktis yang bisa dilakukan hari ini
- Gunakan Bahasa Indonesia yang natural dan bersahabat

PANDUAN RESPONS:
- Akui perasaan user sebelum memberikan saran
- Gunakan data mood yang diberikan untuk memberikan saran yang PERSONAL, bukan generik
- Jika mood cenderung buruk, tanyakan apa yang terjadi dengan empati
- Jika ada tanda krisis atau pikiran bunuh diri, SELALU arahkan ke hotline 119 ext 8
- Respons maksimal 3 paragraf pendek — padat dan bermakna
- JANGAN pernah mendiagnosa kondisi medis atau meresepkan obat`;

/* ─── sendCurhatMessage ─────────────────────────────────── */

export interface CurhatResult {
  reply:   string;
  error?:  string;
}

/**
 * Send a user message to Gemini with the current week's mood stats as context.
 * The AI returns a personalized, empathetic response in Bahasa Indonesia.
 */
export async function sendCurhatMessage(
  userMessage:  string,
  calendarStats: CalendarWeekStats | null,
  /** Previous turns for multi-turn context (role, text pairs) */
  history: { role: "user" | "model"; text: string }[] = [],
): Promise<CurhatResult> {
  if (!userMessage.trim()) return { reply: "", error: "Pesan kosong." };

  try {
    const model = getGeminiModel();

    const moodContext = calendarStats
      ? buildMoodContext(calendarStats)
      : "Data mood belum tersedia minggu ini.";

    /* Gemini chat with history for multi-turn support */
    const chat = model.startChat({
      history: [
        {
          role:  "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role:  "model",
          parts: [{ text: "Siap! Aku Teduh Advisor. Ceritakan apa yang sedang kamu rasakan." }],
        },
        {
          role:  "user",
          parts: [{ text: moodContext }],
        },
        {
          role:  "model",
          parts: [{ text: "Aku sudah melihat data mood kamu. Silakan ceritakan apa yang ingin kamu sampaikan." }],
        },
        ...history.map((h) => ({
          role:  h.role as "user" | "model",
          parts: [{ text: h.text }],
        })),
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const reply  = result.response.text().trim();

    if (!reply) return { reply: "", error: "Tidak ada respons dari AI." };
    return { reply };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
    console.error("[curhat] Gemini error:", msg);

    /* Always return a warm fallback — users should never see an error */
    const fallbacks = [
      "Aku mendengarmu. Perasaan seperti ini sangat wajar, dan kamu tidak harus menghadapinya sendiri. Coba tarik napas perlahan, dan ceritakan lebih lanjut apa yang sedang kamu rasakan? 💚",
      "Terima kasih sudah mau berbagi. Aku di sini bersamamu. Kadang hanya dengan menceritakan apa yang kita rasakan, beban itu sudah terasa sedikit lebih ringan. Ada yang ingin kamu ceritakan lebih dalam? 🌿",
      "Kamu sudah berani untuk mencurahkan perasaanmu — itu langkah yang berarti. Aku ingin memahami lebih dalam situasimu. Bisa ceritakan apa yang paling berat kamu rasakan saat ini? 🍃",
      "Aku mengerti ini tidak mudah. Setiap perasaan yang kamu rasakan itu valid. Yuk kita hadapi bersama — ceritakan lebih, aku siap mendengarkan sepenuhnya. 💜",
    ];
    return {
      reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    };
  }
}

/* ─── generateOverallSummary ────────────────────────────── */

/**
 * Auto-generates a 2–3 sentence "Overall Mood Minggu Ini" summary using Gemini.
 * Called on page load when totalEntries >= 3.
 * Falls back silently to the rule-based `insight` string on any error.
 */
export async function generateOverallSummary(
  stats: CalendarWeekStats,
): Promise<{ summary: string; error?: string }> {
  /*
   * PRD requirement: "Generate analisis mingguan secara otomatis hanya jika
   * data sudah terkumpul minimal 7 hari."
   * We enforce this by requiring:
   *  – at least 7 total entries in the week (≈ 1 entry/day),  AND
   *  – data recorded on at least 3 distinct days (avoids gaming via bulk-logging one day).
   */
  const daysWithData = stats.days.filter((d) => d.count > 0).length;
  if (stats.totalEntries < 7 || daysWithData < 3) {
    return { summary: stats.insight };
  }

  try {
    const model = getGeminiModel();

    const prompt = `
${SYSTEM_PROMPT}

${buildMoodContext(stats)}

Tugas: Tulis SATU paragraf ringkas (2-3 kalimat) sebagai ringkasan empati "Overall Mood Minggu Ini"
untuk pengguna ini. Jadikan sangat personal berdasarkan data di atas.
Akhiri dengan satu kalimat dorongan positif.
Gunakan Bahasa Indonesia yang natural. JANGAN gunakan label seperti "Paragraf:" atau bullet point.
`.trim();

    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim();

    return { summary: text || stats.insight };
  } catch {
    /* Silent fallback — page still loads with rule-based insight */
    return { summary: stats.insight };
  }
}
