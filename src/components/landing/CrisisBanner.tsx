"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Heart, ChevronDown, ExternalLink } from "lucide-react";

const HOTLINES = [
  {
    name:    "Into The Light Indonesia",
    org:     "Kemenkes RI",
    number:  "119 ext 8",
    href:    "tel:119",
    desc:    "Krisis & Pencegahan Bunuh Diri — 24 jam",
    color:   "bg-sage-100 border-sage-200",
    iconBg:  "bg-sage-500",
    badge:   "24/7",
  },
  {
    name:    "Yayasan Pulih",
    org:     "LSM Independen",
    number:  "(021) 788-42580",
    href:    "tel:02178842580",
    desc:    "Pemulihan trauma & dukungan psikologis",
    color:   "bg-lavender-100 border-lavender-200",
    iconBg:  "bg-lavender-400",
    badge:   "Pagi–Sore",
  },
  {
    name:    "Hotline SEJIWA",
    org:     "Yayasan SEJIWA",
    number:  "119 ext 8",
    href:    "tel:119",
    desc:    "Dukungan remaja & anti-bullying",
    color:   "bg-sky-100 border-sky-200",
    iconBg:  "bg-sky-400",
    badge:   "Remaja",
  },
  {
    name:    "Crisis Text / WA",
    org:     "Into The Light",
    number:  "08111-500-454",
    href:    "https://wa.me/628111500454",
    desc:    "Kirim pesan WhatsApp kapan saja",
    color:   "bg-mint-100 border-mint-200",
    iconBg:  "bg-sage-500",
    badge:   "WA",
  },
];

export default function CrisisBanner() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-20 bg-cream relative overflow-hidden" aria-label="Bantuan darurat kesehatan mental">

      {/* Decorative top shape */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-4xl overflow-hidden"
          style={{ borderRadius: "2.5rem" }}
        >
          {/* Card background with gradient */}
          <div className="relative bg-gradient-to-br from-sage-800 via-forest to-sage-900 p-10 md:p-14">

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-sage-700 blob-2 opacity-30 -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-sage-600 blob-1 opacity-20 translate-y-1/3 -translate-x-1/4" />

            {/* Pulsing dot */}
            <div className="relative z-10">
              <div className="flex items-start gap-5 mb-8">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-7 h-7 text-white fill-white/80" />
                </motion.div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-white leading-snug mb-2">
                    Apakah Kamu Sedang dalam Krisis?
                  </h2>
                  <p className="text-sage-200 text-base leading-relaxed max-w-xl">
                    Kamu tidak harus menanggungnya sendirian. Ada orang yang terlatih dan
                    siap mendengarkanmu sekarang — <span className="text-white font-semibold">tanpa biaya, tanpa syarat</span>.
                  </p>
                </div>
              </div>

              {/* Primary hotline CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.a
                  href="tel:119"
                  className="flex items-center justify-center gap-3 px-7 py-4 bg-white text-forest rounded-2xl font-bold text-base shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] hover:bg-sage-50 transition-all"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Telepon hotline 119 darurat"
                >
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Phone className="w-5 h-5" />
                  </motion.div>
                  Telepon Sekarang — 119 ext 8
                </motion.a>
                <motion.a
                  href="https://wa.me/628111500454"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-7 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white rounded-2xl font-semibold text-base transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat via WhatsApp
                </motion.a>
              </div>

              {/* Expand to show all hotlines */}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-2 text-sage-300 hover:text-white text-sm font-medium transition-colors"
                aria-expanded={expanded}
              >
                Lihat semua nomor hotline
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              {/* Expanded hotlines */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{   height: 0,    opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="grid sm:grid-cols-2 gap-3 mt-5">
                      {HOTLINES.map((h, i) => (
                        <motion.a
                          key={i}
                          href={h.href}
                          target={h.href.startsWith("http") ? "_blank" : undefined}
                          rel={h.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className={`flex items-center gap-3.5 p-4 rounded-2xl border ${h.color} group hover:shadow-md transition-all`}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`w-10 h-10 rounded-xl ${h.iconBg} flex items-center justify-center shrink-0`}>
                            <Phone className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-forest truncate">{h.name}</p>
                              <span className="text-[10px] font-bold bg-white border border-border rounded-full px-1.5 py-0.5 text-muted shrink-0">
                                {h.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted">{h.desc}</p>
                            <p className="text-sm font-bold text-forest mt-0.5">{h.number}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom note */}
              <p className="text-sage-300/70 text-xs mt-6">
                * Jika kamu berada di luar Indonesia, hubungi layanan darurat setempat atau kunjungi{" "}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                >
                  findahelpline.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
