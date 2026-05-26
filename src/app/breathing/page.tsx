"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Wind } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type BreathPhase = {
  label: string;
  hint: string;
  duration: number;
  tone: "inhale" | "hold" | "exhale" | "rest";
};

const SCALE_BY_TONE: Record<BreathPhase["tone"], number> = {
  inhale: 1.6,
  hold: 1.2,
  exhale: 0.92,
  rest: 1.05,
};

export default function BreathingPage() {
  const { t } = useLanguage();

  const BREATH_PHASES: BreathPhase[] = [
    { label: t.breathing.phases.inhale[0], hint: t.breathing.phases.inhale[1], duration: 4, tone: "inhale" },
    { label: t.breathing.phases.hold[0],   hint: t.breathing.phases.hold[1],   duration: 4, tone: "hold" },
    { label: t.breathing.phases.exhale[0], hint: t.breathing.phases.exhale[1], duration: 4, tone: "exhale" },
    { label: t.breathing.phases.rest[0],   hint: t.breathing.phases.rest[1],   duration: 4, tone: "rest" },
  ];

  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingState, setBreathingState] = useState(() => ({
    phaseIdx: 0,
    secondsLeft: BREATH_PHASES[0].duration,
  }));

  const { phaseIdx, secondsLeft } = breathingState;

  const activePhase = isBreathing ? BREATH_PHASES[phaseIdx] : null;
  const phaseLabel = activePhase?.label ?? t.breathing.idle;
  const phaseHint = activePhase?.hint ?? t.breathing.idleHint;
  const motionDuration = isBreathing && activePhase ? activePhase.duration : 0.6;

  useEffect(() => {
    if (!isBreathing) return;

    const id = window.setInterval(() => {
      setBreathingState((current) => {
        if (current.secondsLeft <= 1) {
          const nextIdx = (current.phaseIdx + 1) % BREATH_PHASES.length;
          return { phaseIdx: nextIdx, secondsLeft: BREATH_PHASES[nextIdx].duration };
        }
        return { ...current, secondsLeft: current.secondsLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isBreathing]);

  const handleToggle = () => {
    if (isBreathing) {
      setIsBreathing(false);
      setBreathingState({ phaseIdx: 0, secondsLeft: BREATH_PHASES[0].duration });
      return;
    }
    setBreathingState({ phaseIdx: 0, secondsLeft: BREATH_PHASES[0].duration });
    setIsBreathing(true);
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          href="/"
          aria-label={t.breathing.back}
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-sage-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.breathing.back}
        </Link>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-sage-100 bg-white/80 p-8 shadow-[0_18px_50px_-24px_rgba(45,74,53,0.25)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lavender-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sage-100/70 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-sm font-semibold text-sage-700">
              <Wind className="h-4 w-4" />
              {t.breathing.badge}
            </div>
            <h1 className="font-display text-3xl font-semibold text-forest">{t.breathing.title}</h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              {t.breathing.description}
            </p>

            <div className="relative mt-10 flex h-52 w-52 items-center justify-center">
              <motion.div
                animate={{
                  scale: isBreathing && activePhase ? SCALE_BY_TONE[activePhase.tone] : 1,
                  opacity: isBreathing ? 0.35 : 0.08,
                }}
                transition={{ duration: motionDuration, ease: "easeInOut" }}
                className="absolute h-44 w-44 rounded-full bg-lavender-300"
              />
              <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full border-[6px] border-white bg-lavender-50 shadow-[0_4px_18px_-6px_rgba(165,145,204,0.45)]">
                <Wind className={`h-10 w-10 text-lavender-400 ${isBreathing ? "animate-pulse-soft" : ""}`} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={phaseLabel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-base font-semibold text-lavender-500"
                aria-live="polite"
              >
                {phaseLabel}
              </motion.p>
            </AnimatePresence>

            <p className="mt-2 text-sm text-muted">{phaseHint}</p>
            <p className="mt-1 text-xs text-muted-light">
              {isBreathing ? `${t.breathing.timer} ${secondsLeft} ${t.breathing.timerIdle}` : t.breathing.timerIdle}
            </p>

            <button
              onClick={handleToggle}
              className={`mt-6 rounded-full px-8 py-3 text-sm font-bold shadow-sm transition-all ${
                isBreathing
                  ? "border border-border bg-sage-50 text-muted hover:bg-sage-100"
                  : "bg-lavender-400 text-white hover:bg-lavender-500 shadow-[0_6px_18px_-6px_rgba(165,145,204,0.6)]"
              }`}
            >
              {isBreathing ? t.breathing.stop : t.breathing.start}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
