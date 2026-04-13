"use client";

/**
 * RuangTeduh — Mood Calendar Chart (ComposedChart)
 *
 * Visual design:
 *  - Bar  (left Y-axis)  : height = daily entry count (frequency)
 *                          color  = dominant mood color for that day
 *  - Line (right Y-axis) : connects dominant mood SCORES (1–5) across days
 *                          → shows emotional intensity trend
 *  - X-axis              : Indonesian day names (Senin – Minggu / Mon – Sun)
 *  - Descriptive labels  : "Dominan: Tenang" shown below past days' X-tick
 *
 * Accepts: CalendarWeekStats (Mon–Sun anchored, timezone-safe via date-fns)
 */

import { motion } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  MOOD_COLOR,
  MOOD_LABEL,
  MOOD_EMOJI,
  type DayMoodStat,
  type CalendarWeekStats,
} from "@/lib/utils/mood-insights";
import type { MoodId } from "@/types/supabase";

/* ─── Trend badge config ─────────────────────────────────── */
const TREND_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  improving:    { label: "↑ Membaik",    bg: "#EDFAF0", text: "#5A7D61" },
  declining:    { label: "↓ Menurun",    bg: "#F3EEFB", text: "#A591CC" },
  stable:       { label: "→ Stabil",     bg: "#EAF6FB", text: "#55A8C9" },
  mixed:        { label: "~ Bervariasi", bg: "#FEF3EB", text: "#E8AA84" },
  insufficient: { label: "Data kurang", bg: "#F4F8F5", text: "#8B9E8F" },
};

/* ─── Custom X-Axis Tick ─────────────────────────────────── */
interface CustomTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
  chartData: DayMoodStat[];
}

function CustomXAxisTick({ x = 0, y = 0, payload, chartData }: CustomTickProps) {
  const numX = typeof x === "string" ? parseFloat(x) : x;
  const numY = typeof y === "string" ? parseFloat(y) : y;
  const day = chartData.find((d) => d.dayLabel === payload?.value);
  return (
    <g transform={`translate(${numX},${numY})`}>
      {/* Day abbreviation */}
      <text
        x={0} y={0} dy={14}
        textAnchor="middle"
        fill="#8B9E8F"
        fontSize={11}
        fontWeight={500}
      >
        {payload?.value}
      </text>
      {/* "Dominan: X" label for completed days */}
      {day?.dominantLabel && (
        <text
          x={0} y={0} dy={26}
          textAnchor="middle"
          fill={day.color}
          fontSize={9}
          fontWeight={600}
        >
          {day.dominantLabel}
        </text>
      )}
    </g>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────── */
interface CustomTooltipPassedProps {
  active?:  boolean;
  payload?: { payload: DayMoodStat }[];
}
function CustomTooltip({ active, payload }: CustomTooltipPassedProps) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;

  if (day.count === 0) {
    return (
      <div className="bg-white border border-[#E2EDE3] rounded-xl shadow-md px-3 py-2 text-xs">
        <p className="font-semibold text-[#2D4A35]">{day.fullDayLabel}</p>
        <p className="text-[#8B9E8F] mt-0.5">Tidak ada catatan</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white border border-[#E2EDE3] rounded-xl shadow-md px-3 py-2 text-xs"
      style={{ borderLeftColor: day.color, borderLeftWidth: 3 }}
    >
      <p className="font-semibold text-[#2D4A35]">{day.fullDayLabel}</p>
      {day.mood && (
        <p className="mt-1" style={{ color: day.color }}>
          {MOOD_EMOJI[day.mood]} {MOOD_LABEL[day.mood]}
        </p>
      )}
      <p className="text-[#8B9E8F] mt-0.5">
        {day.count} catatan hari ini
      </p>
      {day.score && (
        <p className="text-[#8B9E8F]">
          Intensitas: {day.score}/5
        </p>
      )}
    </div>
  );
}

/* ─── Mood legend ────────────────────────────────────────── */
const MOOD_IDS: MoodId[] = ["kewalahan", "sedih", "biasa", "tenang", "damai"];

/* ─── Main component ─────────────────────────────────────── */
interface MoodCalendarChartProps {
  stats: CalendarWeekStats;
}

export function MoodCalendarChart({ stats }: MoodCalendarChartProps) {
  const { days, overallLabel, trend, totalEntries, weekStart, weekEnd } = stats;
  const badge = TREND_BADGE[trend] ?? TREND_BADGE.insufficient;

  /* Compute max count for Y-axis domain */
  const maxCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white border border-[#E2EDE3] shadow-sm overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#2D4A35]">
            Grafik Mood Kalender
          </h3>
          <p className="text-xs text-[#8B9E8F] mt-0.5">
            {weekStart} — {weekEnd}
            {totalEntries > 0 ? ` · ${totalEntries} catatan` : " · Belum ada catatan"}
          </p>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {badge.label}
        </span>
      </div>

      {/* ── Chart ── */}
      <div className="px-2 overflow-x-auto" style={{ height: 200 }}>
        <div className="min-w-[280px] h-full">
        {totalEntries === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8B9E8F] text-sm">
            Catat mood pertamamu hari ini untuk melihat grafik 🌱
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={days}
              margin={{ top: 8, right: 16, left: -20, bottom: 28 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0F5F1"
                vertical={false}
              />

              {/* Left Y — entry count (bars) */}
              <YAxis
                yAxisId="count"
                orientation="left"
                domain={[0, maxCount + 1]}
                tick={{ fontSize: 10, fill: "#8B9E8F" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              {/* Right Y — mood score 1–5 (line), hidden */}
              <YAxis
                yAxisId="score"
                orientation="right"
                domain={[0.5, 5.5]}
                tick={false}
                axisLine={false}
                tickLine={false}
                width={0}
              />

              {/* Custom X-axis tick renders "Dominan: X" below day name */}
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                tickLine={false}
                height={42}
                tick={(props) => (
                  <CustomXAxisTick
                    {...props}
                    chartData={days}
                  />
                )}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Bar — frequency per day, colored by dominant mood */}
              <Bar
                yAxisId="count"
                dataKey="count"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              >
                {days.map((day, i) => (
                  <Cell
                    key={`bar-${i}`}
                    fill={day.color}
                    fillOpacity={day.count > 0 ? 0.82 : 0.15}
                  />
                ))}
              </Bar>

              {/* Line — emotional intensity trend (mood score) */}
              <Line
                yAxisId="score"
                dataKey="score"
                type="monotone"
                stroke="#5A7D61"
                strokeWidth={2.5}
                strokeDasharray="5 3"
                dot={(props) => {
                  const { cx, cy, payload } = props as {
                    cx: number;
                    cy: number;
                    payload: DayMoodStat;
                  };
                  if (!payload.mood || cx === undefined || cy === undefined) {
                    return <g key={`dot-empty-${cx}`} />;
                  }
                  return (
                    <circle
                      key={`dot-${cx}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={payload.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        </div>
      </div>

      {/* ── Footer: Overall mood + legend ── */}
      <div className="px-5 py-3 border-t border-[#E2EDE3] flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#8B9E8F] font-semibold">
            Mood Keseluruhan
          </p>
          <p className="text-sm font-bold text-[#2D4A35] mt-0.5">
            {overallLabel}
          </p>
        </div>

        {/* Legend dots */}
        <div className="flex flex-wrap gap-2">
          {MOOD_IDS.map((m) => (
            <div key={m} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: MOOD_COLOR[m] }}
              />
              <span className="text-[10px] text-[#8B9E8F]">
                {MOOD_LABEL[m].split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart key ── */}
      <div className="px-5 pb-4 flex items-center gap-4 text-[10px] text-[#8B9E8F]">
        <div className="flex items-center gap-1.5">
          <span className="w-8 h-3 rounded-sm inline-block bg-[#8FAF94] opacity-80" />
          <span>Tinggi balok = jumlah catatan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="24" height="8" viewBox="0 0 24 8">
            <line x1="0" y1="4" x2="24" y2="4" stroke="#5A7D61" strokeWidth="2" strokeDasharray="5 3" />
          </svg>
          <span>Garis = intensitas emosi (1–5)</span>
        </div>
      </div>
    </motion.div>
  );
}
