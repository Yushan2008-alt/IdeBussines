"use client";

/**
 * RuangTeduh — Curhat dengan AI (Gemini Advisor)
 *
 * Features:
 *  - Personalized chat powered by Gemini 1.5 Flash
 *  - Sends current week's mood context as background
 *  - Shows "Overall Mood Minggu Ini" AI summary at the top
 *  - Letter-by-letter reveal for AI responses (typewriter effect)
 *  - Graceful "API not configured" state
 *  - Framer Motion transitions
 *
 * State managed via Zustand (useMoodStore) — messages persist
 * while modal is open. Clear on close opt-in.
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, AlertCircle, RefreshCw, Brain } from "lucide-react";
import { useMoodStore } from "@/store/mood";
import {
  sendCurhatMessage,
  generateOverallSummary,
} from "@/lib/actions/curhat";
import { MOOD_EMOJI, MOOD_LABEL } from "@/lib/utils/mood-insights";

/* ─── Typewriter hook ────────────────────────────────────── */
function useTypewriter(text: string, speed = 18): string {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return displayed;
}

/* ─── Typing indicator ───────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[#A591CC]"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/* ─── Single message bubble ──────────────────────────────── */
interface BubbleProps {
  role: "user" | "ai";
  text: string;
  isLatestAi?: boolean;
}

function MessageBubble({ role, text, isLatestAi }: BubbleProps) {
  const revealed = useTypewriter(isLatestAi ? text : "");
  const display  = isLatestAi ? revealed : text;

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#5A7D61] text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-[#F4F8F5] border border-[#E2EDE3] text-[#2D4A35] px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed">
        {display}
        {isLatestAi && display.length < text.length && (
          <span className="inline-block w-0.5 h-3.5 bg-[#A591CC] ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}

/* ─── Main modal ─────────────────────────────────────────── */
interface CurhatModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function CurhatModal({ isOpen, onClose }: CurhatModalProps) {
  const {
    calendarStats,
    overallSummary,    setOverallSummary,
    isSummaryLoading,  setSummaryLoading,
    curhatMessages,
    addCurhatMessage,
    updateLastAiMessage,
    isAiReplying,      setAiReplying,
    clearCurhat,
  } = useMoodStore();

  const [input,    setInput]    = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const latestAiId = curhatMessages.findLast((m) => m.role === "ai")?.id;

  /* Auto-scroll to bottom when messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [curhatMessages, isAiReplying]);

  /* Generate overall summary once on first open (if data available) */
  useEffect(() => {
    if (!isOpen || overallSummary !== null || !calendarStats) return;
    /* Mirror the gate in generateOverallSummary: ≥7 entries on 7 distinct days */
    const daysWithData = calendarStats.days.filter((d) => d.count > 0).length;
    if (calendarStats.totalEntries < 7 || daysWithData < 7) return;

    setSummaryLoading(true);
    generateOverallSummary(calendarStats).then(({ summary }) => {
      setOverallSummary(summary);
      setSummaryLoading(false);
    });
  }, [isOpen, overallSummary, calendarStats, setOverallSummary, setSummaryLoading]);

  /* Focus input when opened */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  /* Build history array for multi-turn context */
  const buildHistory = useCallback((): { role: "user" | "model"; text: string }[] => {
    return curhatMessages.slice(-10).map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      text: m.text,
    }));
  }, [curhatMessages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isAiReplying) return;

    setInput("");
    setApiError(null);

    /* Add user message */
    addCurhatMessage({
      id:   `user-${Date.now()}`,
      role: "user",
      text: msg,
    });

    /* Start AI reply */
    setAiReplying(true);
    const aiId = `ai-${Date.now()}`;
    addCurhatMessage({ id: aiId, role: "ai", text: "" });

    const { reply, error } = await sendCurhatMessage(
      msg,
      calendarStats,
      buildHistory(),
    );

    setAiReplying(false);

    if (error || !reply) {
      setApiError(error ?? "Tidak ada respons.");
      /* Remove the empty AI placeholder */
      updateLastAiMessage("[AI tidak merespons. Coba lagi.]");
      return;
    }

    updateLastAiMessage(reply);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-x-0 bottom-0 md:inset-auto md:right-6 md:bottom-6 md:w-[420px] z-50
                       flex flex-col bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: "90dvh" }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E2EDE3] shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-[#F3EEFB] flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-[#A591CC]" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#2D4A35]">
                  Curhat dengan AI Advisor
                </h3>
                <p className="text-xs text-[#8B9E8F] truncate">
                  Gemini · Konteks mood 7 hari
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F4F8F5] flex items-center justify-center text-[#8B9E8F] hover:bg-[#E2EDE3] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* ── Overall mood summary banner ── */}
            {(isSummaryLoading || overallSummary) && (
              <div className="mx-4 mt-3 rounded-xl bg-[#F4F8F5] border border-[#E2EDE3] px-4 py-3 shrink-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={11} className="text-[#5A7D61]" />
                  <p className="text-[10px] font-bold text-[#5A7D61] uppercase tracking-wider">
                    Overall Mood Minggu Ini
                  </p>
                </div>
                {isSummaryLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[#8B9E8F]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw size={11} />
                    </motion.div>
                    Menganalisis tren mood-mu…
                  </div>
                ) : (
                  <p className="text-xs text-[#2D4A35] leading-relaxed">{overallSummary}</p>
                )}
              </div>
            )}

            {/* Mood context pills */}
            {calendarStats && calendarStats.totalEntries > 0 && (
              <div className="px-4 mt-2 flex flex-wrap gap-1.5 shrink-0">
                {calendarStats.days
                  .filter((d) => d.mood !== null)
                  .slice(-4)
                  .map((d) => (
                    <span
                      key={d.date}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: d.color + "22",
                        color: d.color,
                      }}
                    >
                      {d.dayLabel}: {d.mood ? MOOD_EMOJI[d.mood] : ""}{" "}
                      {d.mood ? MOOD_LABEL[d.mood] : ""}
                    </span>
                  ))}
              </div>
            )}

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {/* Welcome message */}
              {curhatMessages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F4F8F5] border border-[#E2EDE3] rounded-2xl rounded-bl-md px-4 py-3 text-sm text-[#2D4A35] leading-relaxed"
                >
                  Halo! Aku Teduh Advisor 🌿 Aku sudah membaca tren mood-mu minggu ini.
                  Ceritakan apa yang sedang kamu rasakan — aku di sini untuk mendengarkan.
                </motion.div>
              )}

              {/* Chat messages */}
              {curhatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageBubble
                    role={msg.role}
                    text={msg.text}
                    isLatestAi={msg.id === latestAiId && !isAiReplying}
                  />
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isAiReplying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#F4F8F5] border border-[#E2EDE3] rounded-2xl rounded-bl-md">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              {/* API error */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 text-xs text-[#E8AA84] bg-[#FEF3EB] border border-[#F8D4B4] rounded-xl px-3 py-2"
                >
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input bar ── */}
            <div className="px-4 py-3 border-t border-[#E2EDE3] shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ceritakan perasaanmu…"
                  rows={1}
                  className="flex-1 resize-none bg-[#F4F8F5] border border-[#E2EDE3] rounded-2xl px-4 py-2.5 text-sm text-[#2D4A35] placeholder:text-[#8B9E8F] focus:outline-none focus:ring-2 focus:ring-[#8FAF94] leading-relaxed"
                  style={{ maxHeight: 96 }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
                  }}
                  disabled={isAiReplying}
                />
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isAiReplying}
                  className="w-10 h-10 rounded-full bg-[#5A7D61] disabled:bg-[#E2EDE3] flex items-center justify-center text-white disabled:text-[#8B9E8F] transition-colors shadow-sm shrink-0"
                >
                  <Send size={15} />
                </motion.button>
              </div>
              <p className="text-[10px] text-[#8B9E8F] mt-1.5 text-center">
                Enter kirim · Shift+Enter baris baru
              </p>
            </div>

            {/* Clear chat button */}
            {curhatMessages.length > 0 && (
              <div className="px-4 pb-3 flex justify-center shrink-0">
                <button
                  onClick={clearCurhat}
                  className="text-[10px] text-[#8B9E8F] hover:text-[#2D4A35] transition-colors"
                >
                  Hapus percakapan
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
