'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { logCrisisEvent } from '@/lib/actions/crisis';
import { Phone, Wind, Heart, ShieldCheck, ExternalLink, ChevronDown } from 'lucide-react';

interface Hotline {
  id: string;
  name: string;
  phone: string;
  ext?: string;
  hours: string;
  tel_link: string;
  description: string;
}

interface Props {
  hotlines: Hotline[];
  triggerSource: 'manual_button' | 'bot_keyword' | 'mood_pattern_3day';
  severity: 'low' | 'medium' | 'high';
  matchedKeywords?: string[];
}

const BREATH_PHASES = ['Tarik napas...', 'Tahan...', 'Hembuskan...', 'Istirahat...'] as const;

export function CrisisScreen({ hotlines, triggerSource, severity, matchedKeywords }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathIdx, setBreathIdx] = useState(0);

  useEffect(() => {
    logCrisisEvent({ severity, trigger_source: triggerSource, matched_keywords: matchedKeywords })
      .catch(() => {});
  }, [severity, triggerSource, matchedKeywords]);

  const breathingRef = useRef(breathing);
  useEffect(() => {
    breathingRef.current = breathing;
    if (!breathing) return;
    const id = setInterval(() => {
      setBreathIdx((i) => (i + 1) % BREATH_PHASES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [breathing]);

  const displayed = showAll ? hotlines : hotlines.slice(0, 3);

  return (
    <main className="relative min-h-screen bg-cream overflow-hidden">
      {/* ── Background Blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] blob-1 bg-sage-100 opacity-60"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-16 -right-24 w-[420px] h-[420px] blob-2 bg-peach-100 opacity-50"
          animate={{ scale: [1, 1.06, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute -bottom-24 right-16 w-[360px] h-[360px] blob-3 bg-lavender-100 opacity-40"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 md:py-16">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[2rem] bg-gradient-to-br from-peach-300 to-peach-400 shadow-[0_8px_32px_-8px_rgba(217,143,96,0.5)]"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Heart className="h-8 w-8 text-white fill-white" />
          </motion.div>

          <h1 className="font-display text-3xl font-semibold text-forest md:text-4xl leading-snug mb-3">
            Kamu tidak sendirian.
          </h1>
          <p className="text-muted text-base leading-relaxed mx-auto max-w-md">
            Kalau kamu sedang merasa berat, ada orang yang siap mendengarkan kamu sekarang —{' '}
            <span className="font-semibold text-forest">tanpa biaya, tanpa syarat.</span>
          </p>
        </motion.div>

        {/* ── Primary CTA: 112 Darurat Nasional ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8"
        >
          <a
            href="tel:112"
            onClick={() => logCrisisEvent({ severity, trigger_source: triggerSource, hotline_clicked: '112-darurat' }).catch(() => {})}
            className="group flex items-center justify-center gap-4 rounded-[2.5rem] bg-gradient-to-br from-peach-500 to-peach-600 p-5 text-white shadow-[0_8px_32px_-8px_rgba(217,143,96,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(217,143,96,0.7)] transition-all hover:-translate-y-0.5"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Phone className="h-6 w-6 fill-white/20" />
            </motion.div>
            <div className="text-left">
              <p className="font-bold text-lg leading-tight">Telepon Darurat Nasional — 112</p>
              <p className="text-sm text-white/80 font-medium">Gratis · 24 jam · Dari mana saja</p>
            </div>
          </a>
        </motion.div>

        {/* ── Hotline Cards ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          aria-label="Daftar hotline"
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold text-muted-light uppercase tracking-widest">
              Hotline Tersedia
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            {displayed.map((h) => (
              <motion.a
                key={h.id}
                href={h.tel_link}
                onClick={() => logCrisisEvent({ severity, trigger_source: triggerSource, hotline_clicked: h.id }).catch(() => {})}
                className="group block rounded-[2rem] bg-white p-5 shadow-[0_4px_20px_-8px_rgba(45,74,53,0.06)] border border-border hover:border-peach-200 hover:shadow-[0_8px_28px_-8px_rgba(217,143,96,0.12)] transition-all"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-peach-100 to-peach-50 border border-peach-200">
                    <Phone className="h-4 w-4 text-peach-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-forest text-sm">{h.name}</p>
                    <p className="text-xl font-bold text-peach-500 mt-0.5">
                      {h.phone}{h.ext ? <span className="text-base font-semibold"> ext {h.ext}</span> : ''}
                    </p>
                    <p className="text-xs text-muted mt-1">{h.description}</p>
                    <p className="text-[10px] text-muted-light mt-0.5 font-medium">{h.hours}</p>
                  </div>
                  <ExternalLink className="mt-2 h-4 w-4 shrink-0 text-muted-light opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </motion.a>
            ))}
          </div>

          {hotlines.length > 3 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-muted hover:text-forest transition-colors rounded-2xl hover:bg-sage-50"
            >
              {showAll ? 'Tutup' : `Lihat ${hotlines.length - 3} hotline lainnya`}
              <motion.span animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
          )}
        </motion.section>

        {/* ── Sambil Menunggu: Breathing + Safety Plan ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold text-muted-light uppercase tracking-widest">
              Sambil Menunggu
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Breathing Exercise */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-border shadow-[0_4px_20px_-8px_rgba(45,74,53,0.04)] text-center">
              <div className="flex items-center justify-center gap-2 text-muted mb-4">
                <Wind className="h-4 w-4" />
                <span className="font-semibold text-sm">Latihan Pernapasan</span>
              </div>

              <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center">
                <motion.div
                  animate={{
                    scale: breathing ? (breathIdx === 0 ? 1.5 : 0.95) : 1,
                    opacity: breathing ? 0.3 : 0.06,
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="absolute h-24 w-24 rounded-full bg-lavender-300"
                />
                <div className="z-10 flex h-20 w-20 items-center justify-center rounded-full bg-lavender-50 border-[4px] border-white shadow-[0_4px_16px_-4px_rgba(165,145,204,0.3)]">
                  <Wind className={`h-7 w-7 text-lavender-400 transition-all ${breathing ? 'scale-110' : 'scale-100'}`} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={breathing ? breathIdx : 'idle'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-lavender-500 font-bold text-sm min-h-[1.5rem] mb-4"
                >
                  {breathing ? BREATH_PHASES[breathIdx] : 'Siap untuk mulai?'}
                </motion.p>
              </AnimatePresence>

              <button
                onClick={() => setBreathing((v) => !v)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  breathing
                    ? 'bg-sage-50 text-muted border border-border hover:bg-sage-100'
                    : 'bg-lavender-400 text-white hover:bg-lavender-500 shadow-[0_4px_14px_-4px_rgba(165,145,204,0.5)]'
                }`}
              >
                {breathing ? 'Hentikan' : 'Mulai Bernapas'}
              </button>
            </div>

            {/* Safety Plan + Affirmation */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-border shadow-[0_4px_20px_-8px_rgba(45,74,53,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-sage-500" />
                  <span className="font-semibold text-sm text-forest">Safety Plan</span>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Ingatkan dirimu tentang tanda peringatan, strategi koping, dan kontak darurat yang sudah kamu siapkan.
                </p>
              </div>
              <Link
                href="/dashboard?tab=safety"
                className="inline-flex items-center justify-center gap-2 w-full bg-sage-50 hover:bg-sage-100 text-forest font-semibold text-sm py-3 rounded-full border border-border transition-colors"
              >
                Buka Safety Planku <ShieldCheck className="h-4 w-4" />
              </Link>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-light italic leading-relaxed text-center">
                  &ldquo;Kamu lebih kuat dari yang kamu kira. Bertahanlah.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-xs text-muted-light leading-relaxed"
        >
          Hidupmu berharga. Kamu layak untuk mendapatkan pertolongan.
          <br />
          <span className="font-semibold text-forest">Kamu tidak sendiri.</span>
        </motion.p>

        {/* ── Back to dashboard ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Link
            href="/dashboard"
            className="text-xs text-muted hover:text-forest font-semibold underline transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
