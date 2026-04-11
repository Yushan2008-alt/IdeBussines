"use client";

/**
 * RuangTeduh — Weekly Mood Chart
 *
 * Exports:
 *   WeeklyMoodChart   — full AreaChart used in Tab Jurnal
 *   MiniMoodStrip     — 7 colored circles used in Tab Home
 */

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import type { DotProps } from "recharts";
import {
  MOOD_COLOR,
  MOOD_LABEL,
  MOOD_EMOJI,
  type DayMoodStat,
  type WeeklyStats,
} from "@/lib/utils/mood-insights";
import type { MoodId } from "@/types/supabase";

/* ─── Custom Recharts Dot (colored per mood) ──────────────── */

function MoodDot(props: DotProps & { payload?: DayMoodStat }) {
  const { cx, cy, payload } = props;
  if (!payload?.mood || cx === undefined || cy === undefined) return null;
  const color = MOOD_COLOR[payload.mood];
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      stroke="#fff"
      strokeWidth={2}
    />
  );
}

/* ─── Custom Tooltip ──────────────────────────────────────── */

interface TooltipPayloadEntry {
  payload: DayMoodStat;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;
  if (!day.mood) {
    return (
      <div className="bg-white rounded-xl shadow-md px-3 py-2 text-xs text-[#8B9E8F] border border-[#E2EDE3]">
        <p className="font-medium">{day.dayLabel}</p>
        <p>Tidak ada catatan</p>
      </div>
    );
  }
  return (
    <div
      className="bg-white rounded-xl shadow-md px-3 py-2 text-xs border border-[#E2EDE3]"
      style={{ borderLeftColor: MOOD_COLOR[day.mood], borderLeftWidth: 3 }}
    >
      <p className="font-semibold text-[#2D4A35]">{day.dayLabel}</p>
      <p className="mt-0.5" style={{ color: MOOD_COLOR[day.mood] }}>
        {MOOD_EMOJI[day.mood]} {MOOD_LABEL[day.mood]}
      </p>
      {day.count > 1 && (
        <p className="text-[#8B9E8F] mt-0.5">{day.count} catatan</p>
      )}
    </div>
  );
}

/* ─── WeeklyMoodChart ─────────────────────────────────────── */

interface WeeklyMoodChartProps {
  stats: WeeklyStats;
}

export function WeeklyMoodChart({ stats }: WeeklyMoodChartProps) {
  const { days, overallLabel, trend, insight, totalEntries } = stats;

  const trendBadge: Record<string, { label: string; color: string }> = {
    improving:    { label: "↑ Membaik",  color: "#5A7D61" },
    declining:    { label: "↓ Menurun",  color: "#A591CC" },
    stable:       { label: "→ Stabil",   color: "#55A8C9" },
    mixed:        { label: "~ Bervariasi", color: "#E8AA84" },
    insufficient: { label: "Data kurang", color: "#8B9E8F" },
  };
  const badge = trendBadge[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white border border-[#E2EDE3] overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#2D4A35]">
            Tren Mood 7 Hari
          </h3>
          <p className="text-xs text-[#8B9E8F] mt-0.5">
            {totalEntries === 0
              ? "Belum ada catatan minggu ini"
              : `${totalEntries} catatan minggu ini`}
          </p>
        </div>
        <span
          className="text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: badge.color + "22", color: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      {/* Chart */}
      <div className="px-2 pb-1" style={{ height: 160 }}>
        {totalEntries === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8B9E8F] text-sm">
            Catat mood pertamamu hari ini 🌱
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={days}
              margin={{ top: 8, right: 8, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8FAF94" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8FAF94" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: "#8B9E8F" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0.5, 5.5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: "#8B9E8F" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#8FAF94"
                strokeWidth={2}
                fill="url(#moodGradient)"
                connectNulls
                dot={(props) => {
                  const dotProps = props as unknown as DotProps & { payload?: DayMoodStat };
                  return <MoodDot key={`dot-${dotProps.cx}-${dotProps.cy}`} {...dotProps} />;
                }}
                activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Overall mood row */}
      <div className="px-4 pt-2 pb-3 border-t border-[#E2EDE3] flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#8B9E8F] font-medium">
            Mood Keseluruhan
          </p>
          <p className="text-sm font-semibold text-[#2D4A35] mt-0.5">
            {overallLabel}
          </p>
        </div>
        {/* Mood legend dots */}
        <div className="flex gap-1.5 flex-wrap justify-end">
          {(["kewalahan", "sedih", "biasa", "tenang", "damai"] as MoodId[]).map((m) => (
            <div key={m} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: MOOD_COLOR[m] }}
              />
              <span className="text-[10px] text-[#8B9E8F]">{MOOD_LABEL[m].split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mx-4 mb-4 rounded-xl bg-[#F4F8F5] px-4 py-3 border border-[#E2EDE3]"
      >
        <p className="text-[11px] font-semibold text-[#5A7D61] mb-1">
          💡 Insight Minggu Ini
        </p>
        <p className="text-xs text-[#2D4A35] leading-relaxed">{insight}</p>
      </motion.div>
    </motion.div>
  );
}

/* ─── MiniMoodStrip (Tab Home) ────────────────────────────── */

interface MiniMoodStripProps {
  days: DayMoodStat[];
}

export function MiniMoodStrip({ days }: MiniMoodStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white border border-[#E2EDE3] px-4 py-3 shadow-sm"
    >
      <p className="text-xs font-semibold text-[#2D4A35] mb-3">
        Mood 7 Hari Terakhir
      </p>
      <div className="flex items-end justify-between gap-1">
        {days.map((day, idx) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
            {/* Bar */}
            <div className="relative w-full flex justify-center">
              {day.mood ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 300 }}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: MOOD_COLOR[day.mood] }}
                  title={`${day.dayLabel}: ${MOOD_LABEL[day.mood]}`}
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full border-2 border-dashed border-[#E2EDE3] flex-shrink-0"
                  title={`${day.dayLabel}: Tidak ada catatan`}
                />
              )}
            </div>
            {/* Day label */}
            <span className="text-[10px] text-[#8B9E8F] font-medium leading-none">
              {day.dayLabel}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
