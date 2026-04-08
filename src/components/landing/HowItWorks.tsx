"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, HeartHandshake, TrendingUp } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon:   UserPlus,
    title:  "Daftar dalam 60 Detik",
    desc:   "Buat akun gratis hanya dengan email. Tidak ada pertanyaan panjang, tidak ada data sensitif yang wajib diisi. Privasimu adalah prioritas kami.",
    color:  "bg-sage-100",
    iconColor: "text-sage-600",
    accent: "border-sage-300",
    detail: ["Tanpa nomor telepon", "Nama bisa anonim", "Data dienkripsi"],
  },
  {
    number: "02",
    icon:   HeartHandshake,
    title:  "Ceritakan Perasaanmu",
    desc:   "Gunakan mood journal, bicara dengan Teduh Bot, atau bergabung di komunitas Ruang Cerita. Tidak ada cara yang salah untuk memulai.",
    color:  "bg-lavender-100",
    iconColor: "text-lavender-500",
    accent: "border-lavender-300",
    detail: ["Jurnal harian", "AI Companion 24/7", "Komunitas anonim"],
  },
  {
    number: "03",
    icon:   TrendingUp,
    title:  "Tumbuh Bersama Waktu",
    desc:   "Pantau perjalanan emosionalmu. Setiap entri jurnal, setiap sesi pernapasan, dan setiap percakapan membantumu memahami dirimu sendiri lebih dalam.",
    color:  "bg-peach-100",
    iconColor: "text-peach-500",
    accent: "border-peach-300",
    detail: ["Mood trend mingguan", "Insight personal AI", "Progress gamifikasi"],
  },
];

export default function HowItWorks() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

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
            Cara Kerja
          </p>
          <h2 className="font-display text-4xl xl:text-5xl text-forest font-semibold leading-tight mb-4">
            Sesederhana <span className="gradient-text">Tiga Langkah</span>
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto leading-relaxed">
            Kami tahu memulai adalah bagian yang tersulit.
            Itu sebabnya kami membuatnya semudah mungkin.
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
                  {step.detail.map((d, j) => (
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
