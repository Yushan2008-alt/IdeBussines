"use server";

/**
 * RuangTeduh — Teduh Bot (Gemini-powered)
 *
 * Replaces Supabase Edge Function "teduh-bot".
 * Uses Google Gemini 1.5 Flash for fast, empathetic responses.
 *
 * GEMINI_API_KEY must be set in .env.local (server-only, never NEXT_PUBLIC_).
 *
 * System persona: Teduh Bot — warm Indonesian mental-health companion.
 * Always crisis-aware: if user expresses suicidal thoughts, immediately
 * references hotline 119 ext 8.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { BotMessage } from "@/types/supabase";

/* ─── Teduh Bot system persona ──────────────────────────── */
const TEDUH_SYSTEM_PROMPT = `Kamu adalah Teduh Bot, sahabat empati di platform RuangTeduh — platform kesehatan mental Indonesia.

KEPRIBADIANMU:
- Hangat, sabar, dan hadir sepenuhnya seperti sahabat terpercaya
- Tidak pernah menghakimi, selalu menerima cerita user apa adanya
- Berbicara natural dalam Bahasa Indonesia — tidak kaku, tidak seperti robot
- Gunakan kata "kamu" (bukan "Anda"), pendek dan tulus

PANDUAN RESPONS:
- VALIDASI dulu perasaan user sebelum apapun ("Aku bisa bayangkan betapa beratnya itu...")
- Respons maksimal 3–4 kalimat — padat, menyentuh, bermakna
- Tanya satu pertanyaan terbuka yang mengundang user untuk bercerita lebih
- JANGAN langsung memberi solusi/saran kecuali user yang meminta
- JANGAN mendiagnosa kondisi medis atau meresepkan obat apapun
- JANGAN pernah mengatakan "aku hanya AI" — kamu adalah teman nyata bagi user

PROTOKOL KRISIS (WAJIB):
- Jika user menyebut ingin menyakiti diri, bunuh diri, atau tidak ingin hidup:
  → SEGERA tulis: "Aku sangat peduli padamu. Tolong hubungi Into The Light sekarang di 119 ext 8 — mereka ada 24 jam untuk menemanimu."
  → Tetap hadir, jangan tinggalkan percakapan

KONTEKS PLATFORM:
- RuangTeduh adalah ruang aman, rahasia, tanpa penghakiman
- User bisa juga menggunakan fitur: Jurnal Pribadi, Grafik Mood, Safety Plan, Konsultan Profesional`;

/* ─── Gemini client factory ─────────────────────────────── */
function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature:     0.85,
      maxOutputTokens: 300,   // Keep responses concise
      topP:            0.92,
    },
  });
}

/* ─── Map BotMessage[] → Gemini history ─────────────────── */
function toGeminiHistory(
  messages: BotMessage[],
): { role: "user" | "model"; parts: { text: string }[] }[] {
  return messages
    .filter((m) => m.text.trim())
    .map((m) => ({
      role:  m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));
}

/* ─── Main exported action ──────────────────────────────── */

export interface TeduhBotResult {
  reply:  string;
  error?: string;
}

/**
 * Send a user message to Teduh Bot (Gemini).
 *
 * @param userMessage  The new message from the user.
 * @param history      Previous BotMessage[] for multi-turn context (max last 20).
 * @returns            { reply } on success or { reply: "", error } on failure.
 */
export async function sendTeduhBotMessage(
  userMessage: string,
  history:     BotMessage[] = [],
): Promise<TeduhBotResult> {
  if (!userMessage.trim()) return { reply: "" };

  try {
    const model = getModel();

    /* Build Gemini chat with persona + conversation history */
    const chat = model.startChat({
      history: [
        {
          role:  "user",
          parts: [{ text: TEDUH_SYSTEM_PROMPT }],
        },
        {
          role:  "model",
          parts: [{ text: "Halo, aku Teduh Bot. Ruang ini aman, rahasia, dan tanpa penghakiman. Ada yang ingin kamu sampaikan hari ini? 💚" }],
        },
        /* Previous turns (max last 20 messages for token efficiency) */
        ...toGeminiHistory(history.slice(-20)),
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const reply  = result.response.text().trim();

    if (!reply) return { reply: "", error: "Teduh Bot tidak merespons." };
    return { reply };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg === "GEMINI_API_KEY_MISSING") {
      /* Dev fallback — friendly response when key not configured */
      return {
        reply: "Mendengar ceritamu mengingatkanku betapa tangguhnya dirimu. Jangan lupa bernapas perlahan ya. Aku selalu menemani di sini. 💚",
      };
    }

    console.error("[teduhbot] Gemini error:", msg);

    /* Network/quota fallback — always give human response, never show error to user */
    const fallbacks = [
      "Aku dengar kamu. Perasaan seperti ini sangat wajar — kamu tidak sendirian. Mau cerita lebih? 🌿",
      "Terima kasih sudah mau berbagi. Aku di sini menemanimu. Ada yang ingin kamu ceritakan lebih lanjut? 💚",
      "Kamu sudah sangat berani bercerita. Ambil napas perlahan bersamaku. Aku mendengarmu. 🍃",
    ];
    return {
      reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    };
  }
}
