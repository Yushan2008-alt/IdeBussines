"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Heart, Lock, Zap } from "lucide-react";

const TRUST_BADGES = [
  { icon: Heart,  text: "100% Gratis Selamanya" },
  { icon: Lock,   text: "Data Dienkripsi & Privat" },
  { icon: Zap,    text: "Akses Instan, Tanpa Tunggu" },
];

export default function CTASection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="about" className="py-28 bg-cream relative overflow-hidden">

      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M0,0 C480,48 960,48 1440,0 L1440,48 L0,48 Z" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center" ref={ref}>

        {/* Big emoji */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="text-6xl mb-6"
        >
          🌿
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold text-sage-600 tracking-widest uppercase mb-4"
        >
          Mulai Hari Ini
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="font-display text-4xl xl:text-5xl text-forest font-semibold leading-tight mb-6"
        >
          Ambil Satu Langkah Kecil
          <br />
          <span className="gradient-text">Untuk Dirimu Sendiri.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Tidak perlu tahu harus mulai dari mana. Cukup buka RuangTeduh,
          dan kami akan menemanimu dari sana.{" "}
          <span className="text-forest font-medium">Satu langkah sudah cukup.</span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/dashboard">
            <motion.button
              className="flex items-center gap-3 px-10 py-[1.125rem] bg-sage-500 hover:bg-sage-600 text-white rounded-2xl font-bold text-lg shadow-[0_12px_40px_-12px_rgba(109,148,116,0.65)] transition-all"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Heart className="w-5 h-5 fill-white/70" />
              Daftar Gratis Sekarang
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {TRUST_BADGES.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-sm text-muted">
                <Icon className="w-4 h-4 text-sage-500" />
                <span>{b.text}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
