"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, HeartHandshake, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function HowItWorks() {
  const { t } = useLanguage();
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const STEPS = [
    {
      number: "01",
      icon:   UserPlus,
      title:  t.landing.howItWorks.steps.step1Title,
      desc:   t.landing.howItWorks.steps.step1Desc,
      color:  "bg-sage-100",
      iconColor: "text-sage-600",
      accent: "border-sage-300",
      detail: t.landing.howItWorks.steps.step1Chips,
    },
    {
      number: "02",
      icon:   HeartHandshake,
      title:  t.landing.howItWorks.steps.step2Title,
      desc:   t.landing.howItWorks.steps.step2Desc,
      color:  "bg-lavender-100",
      iconColor: "text-lavender-500",
      accent: "border-lavender-300",
      detail: t.landing.howItWorks.steps.step2Chips,
    },
    {
      number: "03",
      icon:   TrendingUp,
      title:  t.landing.howItWorks.steps.step3Title,
      desc:   t.landing.howItWorks.steps.step3Desc,
      color:  "bg-peach-100",
      iconColor: "text-peach-500",
      accent: "border-peach-300",
      detail: t.landing.howItWorks.steps.step3Chips,
    },
  ];

  return (
    <section id="how-it-works" className="py-28 bg-white relative overflow-hidden">

      {/* Soft bg blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage-50 blob-2 opacity-60 -z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-lavender-50 blob-1 opacity-50 -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-semibold text-lavender-500 tracking-widest uppercase mb-3">
            {t.landing.howItWorks.title}
          </p>
          <h2 className="font-display text-4xl xl:text-5xl text-forest font-semibold leading-tight mb-4">
            {t.landing.howItWorks.heading}
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto leading-relaxed">
            {t.landing.howItWorks.description}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 relative">

          {/* Connector lines (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px">
            <svg width="100%" height="2" className="overflow-visible">
              <motion.line
                x1="0" y1="1" x2="100%" y2="1"
                stroke="#A9C9AC"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.15 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`relative bg-cream-dark rounded-3xl p-8 border-2 ${step.accent} shadow-[0_4px_24px_-8px_rgba(45,74,53,0.06)]`}
              >
                {/* Step number */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]`}>
                    <Icon className={`w-6 h-6 ${step.iconColor}`} strokeWidth={1.8} />
                  </div>
                  <span className="font-display text-5xl font-bold text-border leading-none">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display text-xl font-semibold text-forest mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  {step.desc}
                </p>

                {/* Detail chips */}
                <div className="flex flex-wrap gap-2">
                  {step.detail.map((d: string, j: number) => (
                    <span
                      key={j}
                      className="text-xs font-medium text-forest bg-white border border-border rounded-full px-3 py-1"
                    >
                      ✓ {d}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
