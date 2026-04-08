"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { createClient } from "@/lib/supabase/client";
import { moodScoringConfig } from "@/lib/mood/scoring";
import type { MoodId } from "@/types/supabase";

interface MoodWeeklyInsightsProps {
  userId: string | null;
  refreshTick: number;
}

interface MoodRow {
  mood_id: MoodId;
  created_at: string;
}

interface ChartPoint {
  day: string;
  fullDate: string;
  score: number | null;
  moodLabel: string;
}

const { moodScoreMap, moodThresholds } = moodScoringConfig;

const MOOD_LABEL_MAP: Record<MoodId, string> = {
  kewalahan: "Kewalahan",
  sedih: "Sedih",
  biasa: "Biasa",
  tenang: "Tenang",
  damai: "Damai",
};

const MOOD_TOOLTIP_LABEL_ID = "Mood";
const MS_PER_DAY = 86400000;

const EMOTIONAL_SUGGESTION: Record<MoodId, string> = {
  kewalahan: "Minggu ini terasa berat. Coba ambil jeda 5 menit untuk tarik napas perlahan dan pilih satu hal kecil yang paling bisa kamu selesaikan hari ini.",
  sedih: "Aku menangkap ada rasa sedih yang dominan. Beri ruang untuk perasaanmu, lalu coba hubungi orang yang kamu percaya agar kamu tidak memikulnya sendirian.",
  biasa: "Minggumu cenderung stabil. Pertahankan ritme sehatmu dengan tidur cukup dan menuliskan satu hal yang kamu syukuri setiap hari.",
  tenang: "Minggu ini kamu cukup tenang. Lanjutkan kebiasaan yang menenangkan ini, seperti journaling singkat atau jalan santai 10 menit.",
  damai: "Minggumu terasa damai. Simpan pola ini sebagai anchor saat hari terasa lebih padat, supaya rasa amanmu tetap terjaga.",
};

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function moodFromScore(score: number): MoodId {
  if (score <= moodThresholds.kewalahan) return "kewalahan";
  if (score <= moodThresholds.sedih) return "sedih";
  if (score <= moodThresholds.biasa) return "biasa";
  if (score <= moodThresholds.tenang) return "tenang";
  return "damai";
}

function scoreLabel(score: number | null): string {
  if (score === null) return "Belum ada data";
  return MOOD_LABEL_MAP[moodFromScore(score)];
}

function trendDirection(points: ChartPoint[]): "membaik" | "menurun" | "stabil" {
  const withData = points.filter((p) => p.score !== null);
  if (withData.length < 2) return "stabil";
  const first = withData[0].score ?? 0;
  const last = withData[withData.length - 1].score ?? 0;
  if (last - first >= moodScoringConfig.trendDeltaThreshold) return "membaik";
  if (first - last >= moodScoringConfig.trendDeltaThreshold) return "menurun";
  return "stabil";
}

function getRecencyWeight(createdAtIso: string): number {
  const entryDate = new Date(createdAtIso);
  entryDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffInDays = Math.floor((today.getTime() - entryDate.getTime()) / MS_PER_DAY);
  if (diffInDays < 0 || diffInDays >= moodScoringConfig.weeklyRecencyWeightByDaysAgo.length) return 1;
  return moodScoringConfig.weeklyRecencyWeightByDaysAgo[diffInDays];
}

function extractNumericValue(value: ValueType | undefined): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "number") return value[0];
  return null;
}

function extractFullDate(payload: ReadonlyArray<Payload<ValueType, NameType>>): string {
  const candidate = payload[0]?.payload;
  if (candidate && typeof candidate === "object" && "fullDate" in candidate) {
    const fullDate = (candidate as { fullDate?: unknown }).fullDate;
    if (typeof fullDate === "string") return fullDate;
  }
  return "";
}

export default function MoodWeeklyInsights({ userId, refreshTick }: MoodWeeklyInsightsProps) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [overallMoodText, setOverallMoodText] = useState("Overall mood saya seminggu ini adalah Belum terdeteksi.");
  const [aiInsight, setAiInsight] = useState("Isi mood tracker selama beberapa hari agar Teduh Bot bisa memberi insight yang lebih personal.");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWeeklyMood = async () => {
      if (!userId) {
        setChartData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 6);

      const { data, error } = await supabase
        .from("mood_entries")
        .select("mood_id,created_at")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        setIsLoading(false);
        return;
      }

      const rows = (data ?? []) as MoodRow[];
      const dayMap = new Map<string, { total: number; count: number }>();

      for (const row of rows) {
        const score = moodScoreMap[row.mood_id];
        const key = toDayKey(new Date(row.created_at));
        const current = dayMap.get(key) ?? { total: 0, count: 0 };
        dayMap.set(key, { total: current.total + score, count: current.count + 1 });
      }

      const sevenDays: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        sevenDays.push(d);
      }

      const points: ChartPoint[] = sevenDays.map((d) => {
        const key = toDayKey(d);
        const aggregate = dayMap.get(key);
        const score = aggregate ? Number((aggregate.total / aggregate.count).toFixed(2)) : null;
        return {
          day: d.toLocaleDateString("id-ID", { weekday: "short" }),
          fullDate: d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }),
          score,
          moodLabel: scoreLabel(score),
        };
      });

      const weighted = rows.map((row) => {
        const score = moodScoreMap[row.mood_id];
        const weight = getRecencyWeight(row.created_at);
        return { score, weight };
      });

      const weightedTotals = weighted.reduce(
        (totals, item) => ({
          score: totals.score + (item.score * item.weight),
          weight: totals.weight + item.weight,
        }),
        { score: 0, weight: 0 },
      );
      const averageScore = weightedTotals.weight > 0
        ? weightedTotals.score / weightedTotals.weight
        : null;

      if (averageScore === null) {
        setOverallMoodText("Overall mood saya seminggu ini adalah Belum terdeteksi.");
        setAiInsight("Isi mood tracker selama beberapa hari agar Teduh Bot bisa memberi insight yang lebih personal.");
        setChartData(points);
        setIsLoading(false);
        return;
      }

      const dominantMoodId = moodFromScore(averageScore);
      const dominantMoodLabel = MOOD_LABEL_MAP[dominantMoodId];
      const trend = trendDirection(points);

      setOverallMoodText(`Overall mood saya seminggu ini adalah ${dominantMoodLabel}.`);
      setChartData(points);

      const fallbackInsight = `${EMOTIONAL_SUGGESTION[dominantMoodId]} Tren 7 hari terakhir terlihat ${trend}.`;
      setAiInsight(fallbackInsight);

      try {
        const prompt = `Berikan satu insight empatik (maks 2 kalimat, bahasa Indonesia) dari data mood mingguan ini. Overall mood: ${dominantMoodLabel}. Tren 7 hari: ${trend}. Fokus pada validasi emosi dan satu saran praktis yang lembut.`;
        const { data: aiData, error: aiError } = await supabase.functions.invoke("teduh-bot", {
          body: {
            messages: [{ role: "user", text: prompt }],
          },
        });

        if (!aiError && typeof aiData?.reply === "string" && aiData.reply.trim()) {
          setAiInsight(aiData.reply.trim());
        }
      } catch {
        // Use fallback empathetic insight when edge function is unavailable.
      }

      setIsLoading(false);
    };

    loadWeeklyMood();
  }, [userId, refreshTick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="md:col-span-12 bg-white border border-border p-6 md:p-8 rounded-[2.5rem] shadow-[0_4px_24px_-10px_rgba(45,74,53,0.08)]"
    >
      <div className="mb-4 md:mb-5">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-forest">Statistik Mood 7 Hari</h3>
        <p className="text-sm text-muted mt-1">Pantau pola emosimu secara visual untuk memahami ritme minggu ini.</p>
      </div>

      <div className="h-[240px] rounded-3xl bg-sage-50/60 border border-sage-100 p-3 md:p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-sm text-muted">Memuat grafik mood...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7DA888" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7DA888" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#DDE8DD" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: ValueType | undefined) => {
                  const numericValue = extractNumericValue(value);
                  if (numericValue === null) return ["Belum ada data", MOOD_TOOLTIP_LABEL_ID];
                  return [`Skor ${numericValue.toFixed(2)}`, MOOD_TOOLTIP_LABEL_ID];
                }}
                labelFormatter={(_label: React.ReactNode, payload: ReadonlyArray<Payload<ValueType, NameType>>) => extractFullDate(payload)}
                contentStyle={{ borderRadius: "14px", borderColor: "#DDE8DD" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                connectNulls={false}
                stroke="#6D9474"
                strokeWidth={3}
                fill="url(#moodGradient)"
                activeDot={{ r: 6, fill: "#6D9474", stroke: "#FFFFFF", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-sage-50 border border-sage-100 px-5 py-4">
        <p className="text-sm md:text-base font-semibold text-forest">{overallMoodText}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-4 rounded-2xl bg-lavender-50 border border-lavender-100 px-5 py-4"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-lavender-500 mb-1">AI Insight Empatik</p>
        <p className="text-sm text-forest leading-relaxed">{aiInsight}</p>
      </motion.div>
    </motion.div>
  );
}
