"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BookOpen, MessageCircle, Phone, Users,
  Wind, ShieldCheck, CalendarHeart, Sparkles, Library,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface Feature {
  icon:        React.ElementType;
  title:       string;
  description: string;
  tag:         string;
  color:       string;
  iconColor:   string;
  cardBg:      string;
  size:        "normal" | "wide" | "tall";
}

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
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${feature.color} opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl`} />

      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]`}>
          <Icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={1.8} />
        </div>

        <span className="inline-block text-xs font-semibold text-muted bg-white/70 border border-border rounded-full px-2.5 py-0.5 mb-3">
          {feature.tag}
        </span>

        <h3 className="font-display text-lg font-semibold text-forest mb-2 leading-snug">
          {feature.title}
        </h3>

        <p className="text-sm text-muted leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const { t } = useLanguage();
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const FEATURES: Feature[] = [
    {
      icon:        BookOpen,
      title:       t.landing.features.items.moodJournal[0],
      description: t.landing.features.items.moodJournal[1],
      tag:         t.landing.features.items.moodJournal[2],
      color:       "bg-sage-100",
      iconColor:   "text-sage-600",
      cardBg:      "bg-sage-50",
      size:        "normal",
    },
    {
      icon:        MessageCircle,
      title:       t.landing.features.items.teduhBot[0],
      description: t.landing.features.items.teduhBot[1],
      tag:         t.landing.features.items.teduhBot[2],
      color:       "bg-lavender-100",
      iconColor:   "text-lavender-500",
      cardBg:      "bg-lavender-50",
      size:        "wide",
    },
    {
      icon:        Phone,
      title:       t.landing.features.items.crisisSOS[0],
      description: t.landing.features.items.crisisSOS[1],
      tag:         t.landing.features.items.crisisSOS[2],
      color:       "bg-peach-100",
      iconColor:   "text-peach-500",
      cardBg:      "bg-peach-50",
      size:        "normal",
    },
    {
      icon:        Users,
      title:       t.landing.features.items.komunitas[0],
      description: t.landing.features.items.komunitas[1],
      tag:         t.landing.features.items.komunitas[2],
      color:       "bg-sky-100",
      iconColor:   "text-sky-400",
      cardBg:      "bg-sky-50",
      size:        "normal",
    },
    {
      icon:        Wind,
      title:       t.landing.features.items.breathing[0],
      description: t.landing.features.items.breathing[1],
      tag:         t.landing.features.items.breathing[2],
      color:       "bg-mint-100",
      iconColor:   "text-sage-500",
      cardBg:      "bg-mint-50",
      size:        "normal",
    },
    {
      icon:        ShieldCheck,
      title:       t.landing.features.items.safetyPlan[0],
      description: t.landing.features.items.safetyPlan[1],
      tag:         t.landing.features.items.safetyPlan[2],
      color:       "bg-sage-100",
      iconColor:   "text-sage-700",
      cardBg:      "bg-white",
      size:        "wide",
    },
    {
      icon:        CalendarHeart,
      title:       t.landing.features.items.konsultasi[0],
      description: t.landing.features.items.konsultasi[1],
      tag:         t.landing.features.items.konsultasi[2],
      color:       "bg-lavender-100",
      iconColor:   "text-lavender-600",
      cardBg:      "bg-white",
      size:        "normal",
    },
    {
      icon:        Sparkles,
      title:       t.landing.features.items.afirmasi[0],
      description: t.landing.features.items.afirmasi[1],
      tag:         t.landing.features.items.afirmasi[2],
      color:       "bg-peach-100",
      iconColor:   "text-peach-400",
      cardBg:      "bg-white",
      size:        "normal",
    },
    {
      icon:        Library,
      title:       t.landing.features.items.resource[0],
      description: t.landing.features.items.resource[1],
      tag:         t.landing.features.items.resource[2],
      color:       "bg-sky-100",
      iconColor:   "text-sky-400",
      cardBg:      "bg-white",
      size:        "normal",
    },
  ];

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
            {t.landing.features.title}
          </p>
          <h2 className="font-display text-4xl xl:text-5xl text-forest font-semibold leading-tight mb-4">
            {t.landing.features.heading}
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            {t.landing.features.description}
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
            {t.landing.features.note}
          </p>
          <motion.a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-forest text-cream rounded-2xl font-semibold text-sm shadow-[0_8px_24px_-8px_rgba(45,74,53,0.35)] hover:bg-forest-light transition-all"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.landing.features.cta}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
