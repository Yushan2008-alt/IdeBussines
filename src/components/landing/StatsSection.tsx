"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

interface Stat {
  value:    number;
  suffix:   string;
  prefix?:  string;
  label:    string;
  sublabel: string;
  color:    string;
  emoji:    string;
}

/* Count-up hook */
function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [inView, target, duration]);
  return count;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count  = useCountUp(stat.value, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`relative rounded-3xl bg-gradient-to-br ${stat.color} p-8 overflow-hidden border border-white shadow-[0_4px_24px_-8px_rgba(45,74,53,0.08)]`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/40 blur-sm" />

      <div className="relative z-10">
        <span className="text-4xl mb-4 block">{stat.emoji}</span>
        <p className="font-display text-4xl xl:text-5xl font-bold text-forest mb-1 tabular-nums">
          {count}
          <span className="text-2xl xl:text-3xl">{stat.suffix}</span>
        </p>
        <p className="font-semibold text-forest text-base mb-2">{stat.label}</p>
        <p className="text-sm text-muted leading-relaxed">{stat.sublabel}</p>
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const { t } = useLanguage();
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const STATS: Stat[] = [
    {
      value:    19,
      suffix:   " Juta+",
      label:    t.landing.stats.stat1Label,
      sublabel: t.landing.stats.stat1Sub,
      color:    "from-lavender-100 to-lavender-50",
      emoji:    "🧠",
    },
    {
      value:    95,
      suffix:   "%",
      label:    t.landing.stats.stat2Label,
      sublabel: t.landing.stats.stat2Sub,
      color:    "from-peach-100 to-peach-50",
      emoji:    "💬",
    },
    {
      value:    100,
      suffix:   "% Gratis",
      label:    t.landing.stats.stat3Label,
      sublabel: t.landing.stats.stat3Sub,
      color:    "from-sage-100 to-sage-50",
      emoji:    "💚",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none rotate-180">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-14 fill-cream">
          <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-sage-600 tracking-widest uppercase mb-3">
            {t.landing.stats.title}
          </p>
          <h2 className="font-display text-4xl xl:text-5xl text-forest font-semibold leading-tight max-w-2xl mx-auto">
            {t.landing.stats.heading}
          </h2>
          <p className="text-muted text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            {t.landing.stats.description}
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {STATS.map((s, i) => (
            <StatCard key={i} stat={s} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-light mt-8"
        >
          {t.landing.stats.source}
        </motion.p>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-14 fill-cream">
          <path d="M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
