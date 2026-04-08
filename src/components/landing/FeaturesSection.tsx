"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BookOpen, MessageCircle, Phone, Users,
  Wind, ShieldCheck, CalendarHeart, Sparkles, Library,
} from "lucide-react";

interface Feature {
  icon:        React.ElementType;
  title:       string;
  description: string;
  tag:         string;
  color:       string;   /* bg color for icon wrapper */
  iconColor:   string;   /* icon stroke color */
  cardBg:      string;   /* card bg */
  size:        "normal" | "wide" | "tall"; /* layout variety */
}

const FEATURES: Feature[] = [
  {
    icon:        BookOpen,
    title:       "Mood Journal & Tracker",
    description: "Catat perasaan harianmu dengan mood wheel interaktif. Lihat pola emosimu selama seminggu dan dapatkan insight dari AI yang empatik.",
    tag:         "Fitur Inti",
    color:       "bg-sage-100",
    iconColor:   "text-sage-600",
    cardBg:      "bg-sage-50",
    size:        "normal",
  },
  {
    icon:        MessageCircle,
    title:       "Teduh Bot — AI Companion",
    description: "Teman bicara 24/7 berbasis AI. Tidak menghakimi, selalu ada, dan berbicara dalam Bahasa Indonesia yang hangat dan manusiawi.",
    tag:         "AI-Powered",
    color:       "bg-lavender-100",
    iconColor:   "text-lavender-500",
    cardBg:      "bg-lavender-50",
    size:        "wide",
  },
  {
    icon:        Phone,
    title:       "Crisis SOS",
    description: "Satu tombol menghubungkanmu langsung ke hotline darurat nyata: Into The Light (119 ext 8), Yayasan Pulih, dan lainnya. Respons dalam hitungan detik.",
    tag:         "🚨 Keselamatan",
    color:       "bg-peach-100",
    iconColor:   "text-peach-500",
    cardBg:      "bg-peach-50",
    size:        "normal",
  },
  {
    icon:        Users,
    title:       "Ruang Cerita — Komunitas Anonim",
    description: "Berbagi cerita, memberi dan menerima dukungan dalam komunitas yang aman, anonim, dan bebas penghakiman.",
    tag:         "Komunitas",
    color:       "bg-sky-100",
    iconColor:   "text-sky-400",
    cardBg:      "bg-sky-50",
    size:        "normal",
  },
  {
    icon:        Wind,
    title:       "Guided Breathing & Grounding",
    description: "Teknik 4-7-8 breathing, box breathing, dan 5-4-3-2-1 grounding yang dipandu. Tenangkan sistem saraf dalam 5 menit.",
    tag:         "Mindfulness",
    color:       "bg-mint-100",
    iconColor:   "text-sage-500",
    cardBg:      "bg-mint-50",
    size:        "normal",
  },
  {
    icon:        ShieldCheck,
    title:       "Safety Plan Builder",
    description: "Buat rencana keselamatan personalmu: kenali tanda peringatan, strategi coping, dan kontak darurat. Disimpan aman dan bisa diakses kapan saja.",
    tag:         "Keselamatan",
    color:       "bg-sage-100",
    iconColor:   "text-sage-700",
    cardBg:      "bg-white",
    size:        "wide",
  },
  {
    icon:        CalendarHeart,
    title:       "Konsultasi Profesional",
    description: "Terhubung dengan psikolog dan konselor berlisensi. Jadwalkan sesi online kapan dan di mana pun.",
    tag:         "Coming Soon ✦",
    color:       "bg-lavender-100",
    iconColor:   "text-lavender-600",
    cardBg:      "bg-white",
    size:        "normal",
  },
  {
    icon:        Sparkles,
    title:       "Afirmasi & Micro-Challenges",
    description: "Mulai harimu dengan afirmasi positif dan tantangan kecil yang dirancang untuk membangun ketahanan mental secara bertahap.",
    tag:         "Daily Habit",
    color:       "bg-peach-100",
    iconColor:   "text-peach-400",
    cardBg:      "bg-white",
    size:        "normal",
  },
  {
    icon:        Library,
    title:       "Resource Library",
    description: "Ratusan artikel, video, dan panduan psikoedukatif yang dikurasi oleh profesional. Gratis, selalu diperbarui.",
    tag:         "Edukasi",
    color:       "bg-sky-100",
    iconColor:   "text-sky-400",
    cardBg:      "bg-white",
    size:        "normal",
  },
];

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const;

const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1 },
} as const;

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={cardVariants as import("framer-motion").Variants}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      className={`relative rounded-3xl p-6 border border-white/80 shadow-[0_2px_20px_-6px_rgba(45,74,53,0.07)] overflow-hidden group cursor-default
        ${feature.cardBg}
        ${feature.size === "wide" ? "md:col-span-2" : ""}
        ${feature.size === "tall" ? "md:row-span-2" : ""}
      `}
    >
      {/* Soft background blob on hover */}
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${feature.color} opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl`} />

      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]`}>
          <Icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={1.8} />
        </div>

        {/* Tag */}
        <span className="inline-block text-xs font-semibold text-muted bg-white/70 border border-border rounded-full px-2.5 py-0.5 mb-3">
          {feature.tag}
        </span>

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-forest mb-2 leading-snug">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-28 bg-cream relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-sage-600 tracking-widest uppercase mb-3">
            9 Fitur Utama
          </p>
          <h2 className="font-display text-4xl xl:text-5xl text-forest font-semibold leading-tight mb-4">
            Semua yang Kamu Butuhkan,
            <br />
            <span className="gradient-text">Dalam Satu Ruang</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Dari catatan harian hingga krisis darurat — RuangTeduh dirancang
            untuk menemanimu di setiap titik perjalanan.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants as import("framer-motion").Variants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-center mt-14"
        >
          <p className="text-muted text-sm mb-4">
            Semua fitur di atas tersedia secara penuh, tanpa langganan, tanpa biaya tersembunyi.
          </p>
          <motion.a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-forest text-cream rounded-2xl font-semibold text-sm shadow-[0_8px_24px_-8px_rgba(45,74,53,0.35)] hover:bg-forest-light transition-all"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Coba Semua Fitur — Gratis ✨
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
