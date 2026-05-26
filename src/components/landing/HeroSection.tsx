"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Users, Sparkles, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

/* ── Breathing phases ── */
type BreathPhase = { label: string; range: [number, number] };
const BREATH_PHASES: BreathPhase[] = [
  { label: "Tarik napas...",  range: [0,   33]  },
  { label: "Tahan...",        range: [33,  66]  },
  { label: "Hembuskan...",    range: [66,  100] },
];
function getBreathLabel(progress: number): string {
  for (const phase of BREATH_PHASES) {
    if (progress >= phase.range[0] && progress < phase.range[1]) return phase.label;
  }
  return "Tarik napas...";
}

/* ── Stagger variants ── */
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
} as const;

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0  },
} as const;

export default function HeroSection() {
  const { t } = useLanguage();

  const MOODS = [
    { emoji: "😔", label: t.landing.hero.moodLabels[0] },
    { emoji: "😟", label: t.landing.hero.moodLabels[1] },
    { emoji: "😐", label: t.landing.hero.moodLabels[2] },
    { emoji: "🙂", label: t.landing.hero.moodLabels[3] },
    { emoji: "😊", label: t.landing.hero.moodLabels[4] },
  ];
  const ROTATING_WORDS = t.landing.hero.words;

  const [selectedMood, setSelectedMood] = useState(2);
  const [wordIndex,    setWordIndex]    = useState(0);
  const [barProgress,  setBarProgress]  = useState(0);

  /* Rotate headline word every 2.5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  /* Animate breathing progress bar — 4s full cycle */
  useEffect(() => {
    const id = setInterval(() => {
      setBarProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream pt-20 pb-16">

      {/* ──────── Background Blobs ──────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] blob-1 bg-sage-100 opacity-70"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-16 -right-24 w-[420px] h-[420px] blob-2 bg-lavender-100 opacity-60"
          animate={{ scale: [1, 1.06, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute -bottom-24 right-16 w-[360px] h-[360px] blob-3 bg-peach-100 opacity-50"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-[280px] h-[280px] blob-1 bg-sky-100 opacity-40"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #2D4A35 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ──────────────────── LEFT: Copy ──────────────────── */}
          <motion.div
            variants={containerVariants as import("framer-motion").Variants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants as import("framer-motion").Variants}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sage-200 text-sm font-medium text-sage-700 shadow-sm mb-8">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="w-3.5 h-3.5 fill-sage-400 text-sage-400" />
                </motion.span>
                {t.landing.hero.badge}
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={itemVariants as import("framer-motion").Variants} className="mb-6">
              <h1 className="font-display text-5xl xl:text-6xl text-forest leading-[1.15] font-semibold">
                {t.landing.hero.tagline.split("{word}")[0]}
                <br className="hidden sm:block" />
                <span className="relative inline-block">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      className="gradient-text"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{   opacity: 0, y: -16 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                    >
                      {ROTATING_WORDS[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {t.landing.hero.tagline.split("{word}")[1]}
              </h1>
            </motion.div>

            {/* Sub-copy */}
            <motion.p
              variants={itemVariants as import("framer-motion").Variants}
              className="text-lg text-muted leading-relaxed mb-10 max-w-lg"
            >
              {t.landing.hero.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants as import("framer-motion").Variants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link href="/dashboard">
                <motion.button
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-sage-500 hover:bg-sage-600 text-white rounded-2xl font-semibold text-base shadow-[0_8px_28px_-8px_rgba(109,148,116,0.6)] transition-all"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t.landing.hero.cta}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <motion.button
                  className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-sage-200 hover:border-sage-400 hover:bg-sage-50 text-forest rounded-2xl font-semibold text-base transition-all"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.landing.hero.seeHow}
                </motion.button>
              </Link>
            </motion.div>

            {/* Social Proof Row */}
            <motion.div
              variants={itemVariants as import("framer-motion").Variants}
              className="flex items-center gap-5 flex-wrap"
            >
              <div className="flex -space-x-2">
                {["🧑", "👩", "🧒", "👦", "👧"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white bg-sage-100 flex items-center justify-center text-base shadow-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-peach-400 text-peach-400" />
                  ))}
                </div>
                <p className="text-sm text-muted">
                  {t.landing.hero.trusted}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ──────────────────── RIGHT: Phone Mockup ──────────────────── */}
          <motion.div
            className="relative flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glow behind phone */}
            <div className="absolute w-80 h-80 rounded-full bg-sage-200 opacity-40 blur-3xl -z-10" />

            {/* Phone frame */}
            <motion.div
              className="relative w-72 h-[580px]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Outer shell */}
              <div className="w-full h-full bg-white rounded-[3.5rem] border-[5px] border-sage-200 shadow-[0_40px_80px_-20px_rgba(45,74,53,0.18),0_0_0_1px_rgba(45,74,53,0.04)] overflow-hidden">

                {/* Top notch */}
                <div className="relative bg-white pt-4 px-6 pb-2">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-sage-100 rounded-full" />
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-xs font-semibold text-muted">9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-4 h-2 bg-sage-400 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* App content */}
                <div className="bg-cream px-4 pb-4 flex flex-col gap-3 h-full overflow-hidden">

                  {/* Greeting */}
                  <div>
                    <p className="text-xs text-muted">{t.landing.hero.greeting}</p>
                    <p className="font-display text-sm font-semibold text-forest leading-tight">
                      {t.landing.hero.howFeel}
                    </p>
                  </div>

                  {/* Mood selector */}
                  <div className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_-4px_rgba(45,74,53,0.08)]">
                    <div className="grid grid-cols-5 gap-1.5">
                      {MOODS.map((m, i) => (
                        <motion.button
                          key={i}
                          onClick={() => setSelectedMood(i)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-lg
                            ${selectedMood === i
                              ? "bg-sage-400 shadow-[0_4px_10px_-4px_rgba(109,148,116,0.5)] scale-110"
                              : "bg-sage-50 hover:bg-sage-100"}`}
                          whileHover={{ scale: selectedMood === i ? 1.1 : 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={m.label}
                        >
                          {m.emoji}
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-center text-xs text-muted mt-2 font-medium">
                      {MOODS[selectedMood].label}
                    </p>
                  </div>

                  {/* Journal card */}
                  <div className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_-4px_rgba(45,74,53,0.06)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">📓</span>
                      <p className="text-xs font-semibold text-forest">{t.landing.hero.journalToday}</p>
                    </div>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                      {t.landing.hero.journalEntry}
                    </p>
                  </div>

                  {/* Breathing progress — with phase label */}
                  <div className="bg-lavender-50 rounded-2xl p-3 border border-lavender-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🌬️</span>
                        <p className="text-xs font-semibold text-forest">{t.landing.hero.breathing}</p>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={getBreathLabel(barProgress)}
                          className="text-[10px] text-lavender-500 font-medium"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{   opacity: 0, y: -4 }}
                          transition={{ duration: 0.25 }}
                        >
                          {getBreathLabel(barProgress)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-lavender-400 rounded-full"
                        style={{ width: `${barProgress}%` }}
                        transition={{ duration: 0.05 }}
                      />
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div
                      className="bg-peach-50 border border-peach-100 rounded-xl p-3 flex items-center gap-2 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="text-base">💬</span>
                      <div>
                        <p className="text-xs font-semibold text-forest">{t.landing.hero.chatAI}</p>
                        <p className="text-[10px] text-muted">{t.landing.hero.teduhBot}</p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center gap-2 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="text-base">🫂</span>
                      <div>
                        <p className="text-xs font-semibold text-forest">{t.landing.hero.community}</p>
                        <p className="text-[10px] text-muted">{t.landing.hero.anonymous}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Affirmation card */}
                  <div className="bg-sage-500 rounded-2xl p-3 text-white">
                    <p className="text-[10px] font-medium opacity-75 mb-0.5">✨ {t.landing.hero.affirmation}</p>
                    <p className="text-xs font-semibold leading-relaxed">
                      &ldquo;{t.landing.hero.affirmationText}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Floating Cards — hidden on small screens to prevent clipping ── */}

              {/* Left: Community badge */}
              <motion.div
                className="absolute -left-36 top-24 glass rounded-2xl px-4 py-3 shadow-[0_8px_32px_-8px_rgba(45,74,53,0.12)] flex items-center gap-3 w-52 hidden xl:flex"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-sage-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-forest">{t.landing.hero.activeCommunity}</p>
                  <p className="text-xs text-muted">{t.landing.hero.communityMembers}</p>
                </div>
              </motion.div>

              {/* Right: Weekly mood chart */}
              <motion.div
                className="absolute -right-36 top-40 glass rounded-2xl p-3 shadow-[0_8px_32px_-8px_rgba(45,74,53,0.12)] w-36 hidden xl:block"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <p className="text-[10px] font-semibold text-forest mb-1.5">📈 {t.landing.hero.moodThisWeek}</p>
                <div className="flex items-end gap-0.5 h-9">
                  {[35, 55, 40, 70, 60, 82, 90].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor: h > 65 ? "#8FAF94" : "#C5D8C8",
                      }}
                      initial={{ scaleY: 0, originY: 1 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.8 + i * 0.08, duration: 0.4 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Bottom-left: AI response */}
              <motion.div
                className="absolute -left-32 bottom-32 glass rounded-2xl px-3.5 py-2.5 shadow-[0_8px_32px_-8px_rgba(45,74,53,0.12)] w-48 hidden xl:block"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-lavender-300 flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                  <p className="text-[10px] font-semibold text-forest">{t.landing.hero.teduhBot}</p>
                </div>
                <p className="text-[10px] text-muted leading-relaxed">
                  &ldquo;{t.landing.hero.teduhBotResponse}&rdquo;
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* ──────── Scroll indicator — desktop only ──────── */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-xs text-muted-light font-medium tracking-wider uppercase">{t.landing.hero.scrollDown}</p>
          <motion.div className="w-5 h-8 rounded-full border-2 border-muted-light flex items-start justify-center pt-1">
            <motion.div
              className="w-1.5 h-1.5 bg-muted rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
