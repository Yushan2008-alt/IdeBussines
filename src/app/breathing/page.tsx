"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Wind } from "lucide-react";

type BreathPhase = {
  label: string;
  hint: string;
  duration: number;
  tone: "inhale" | "hold" | "exhale" | "rest";
};

const BREATH_PHASES: BreathPhase[] = [
  { label: "Tarik napas...", hint: "Tarik perlahan lewat hidung.", duration: 4, tone: "inhale" },
  { label: "Tahan...", hint: "Tahan sebentar tanpa tegang.", duration: 4, tone: "hold" },
  { label: "Hembuskan...", hint: "Hembuskan pelan lewat mulut.", duration: 4, tone: "exhale" },
  { label: "Istirahat...", hint: "Rilekskan bahu dan rahang.", duration: 4, tone: "rest" },
];

const SCALE_BY_TONE: Record<BreathPhase["tone"], number> = {
  inhale: 1.6,
  hold: 1.2,
  exhale: 0.92,
  rest: 1.05,
};

export default function BreathingPage() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BREATH_PHASES[0].duration);

  const activePhase = isBreathing ? BREATH_PHASES[phaseIdx] : null;
  const phaseLabel = activePhase?.label ?? "Siap untuk mulai?";
  const phaseHint = activePhase?.hint ?? "Mulai kapan pun kamu siap.";

  useEffect(() => {
    if (!isBreathing) return;

    const id = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          const nextIdx = (phaseIdx + 1) % BREATH_PHASES.length;
          setPhaseIdx(nextIdx);
          return BREATH_PHASES[nextIdx].duration;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isBreathing, phaseIdx]);

  const handleToggle = () => {
    if (isBreathing) {
      setIsBreathing(false);
      setPhaseIdx(0);
      setSecondsLeft(BREATH_PHASES[0].duration);
      return;
    }
    setPhaseIdx(0);
    setSecondsLeft(BREATH_PHASES[0].duration);
    setIsBreathing(true);
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-sage-700">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-sage-100 bg-white/80 p-8 shadow-[0_18px_50px_-24px_rgba(45,74,53,0.25)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lavender-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sage-100/70 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-sm font-semibold text-sage-700">
              <Wind className="h-4 w-4" />
              Guided Breathing
            </div>
            <h1 className="font-display text-3xl font-semibold text-forest">Tarik napas, perlahan.</h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              Gunakan pola 4-4-4-4 untuk menenangkan sistem saraf. Fokus pada napas dan biarkan tubuhmu mengikuti ritme.
            </p>

            <div className="relative mt-10 flex h-52 w-52 items-center justify-center">
              <motion.div
                animate={{
                  scale: isBreathing && activePhase ? SCALE_BY_TONE[activePhase.tone] : 1,
                  opacity: isBreathing ? 0.35 : 0.08,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
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
              {isBreathing ? `Sisa ${secondsLeft} detik` : "Tekan mulai untuk memulai siklus."}
            </p>

            <button
              onClick={handleToggle}
              className={`mt-6 rounded-full px-8 py-3 text-sm font-bold shadow-sm transition-all ${
                isBreathing
                  ? "border border-border bg-sage-50 text-muted hover:bg-sage-100"
                  : "bg-lavender-400 text-white hover:bg-lavender-500 shadow-[0_6px_18px_-6px_rgba(165,145,204,0.6)]"
              }`}
            >
              {isBreathing ? "Hentikan" : "Mulai Bernapas"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
