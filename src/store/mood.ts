/**
 * RuangTeduh — Mood Zustand Store
 *
 * Manages state for:
 *  1. CalendarWeekStats  — data for MoodCalendarChart (ComposedChart)
 *  2. Curhat chat         — message history for Gemini AI advisor
 *  3. Overall AI summary  — auto-generated "Overall Mood Minggu Ini"
 *
 * Usage (client component only):
 *   import { useMoodStore } from "@/store/mood";
 *   const { calendarStats, setCalendarStats } = useMoodStore();
 */

import { create } from "zustand";
import type { CalendarWeekStats } from "@/lib/utils/mood-insights";

/* ─── Curhat message type ───────────────────────────────── */
export interface CurhatMessage {
  id:   string;
  role: "user" | "ai";
  text: string;
}

/* ─── Store shape ───────────────────────────────────────── */
interface MoodState {
  /* ── Calendar chart data ── */
  calendarStats:       CalendarWeekStats | null;
  isStatsLoading:      boolean;

  /* ── Gemini overall summary (auto-generated on page load) ── */
  overallSummary:      string | null;
  isSummaryLoading:    boolean;

  /* ── Curhat chat ── */
  curhatMessages:      CurhatMessage[];
  isAiReplying:        boolean;

  /* ── Actions ── */
  setCalendarStats:    (stats: CalendarWeekStats) => void;
  setStatsLoading:     (v: boolean) => void;
  setOverallSummary:   (s: string | null) => void;
  setSummaryLoading:   (v: boolean) => void;
  addCurhatMessage:    (msg: CurhatMessage) => void;
  updateLastAiMessage: (text: string) => void;
  setAiReplying:       (v: boolean) => void;
  clearCurhat:         () => void;
}

/* ─── Store implementation ──────────────────────────────── */
export const useMoodStore = create<MoodState>()((set) => ({
  /* Initial state */
  calendarStats:    null,
  isStatsLoading:   false,
  overallSummary:   null,
  isSummaryLoading: false,
  curhatMessages:   [],
  isAiReplying:     false,

  /* Setters */
  setCalendarStats:  (stats) => set({ calendarStats: stats }),
  setStatsLoading:   (v)     => set({ isStatsLoading: v }),
  setOverallSummary: (s)     => set({ overallSummary: s }),
  setSummaryLoading: (v)     => set({ isSummaryLoading: v }),

  addCurhatMessage: (msg) =>
    set((state) => ({
      curhatMessages: [...state.curhatMessages, msg],
    })),

  /** Appends text to the last AI message — for streaming-style reveal. */
  updateLastAiMessage: (text) =>
    set((state) => {
      const messages = [...state.curhatMessages];
      const last = messages[messages.length - 1];
      if (last && last.role === "ai") {
        messages[messages.length - 1] = { ...last, text };
      }
      return { curhatMessages: messages };
    }),

  setAiReplying: (v) => set({ isAiReplying: v }),

  clearCurhat: () =>
    set({
      curhatMessages: [],
      isAiReplying:   false,
    }),
}));
