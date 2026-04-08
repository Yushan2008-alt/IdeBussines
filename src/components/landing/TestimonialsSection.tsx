"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Aku nggak nyangka ada aplikasi yang bisa bikin aku ngerasa 'dipahami'. Teduh Bot bukan cuma bot — dia jawab dengan cara yang manusiawi banget. Aku mulai nulis jurnal lagi setelah 3 tahun berhenti.",
    author:     "Pengguna Anonim",
    role:       "Mahasiswa, 22 tahun",
    emoji:      "🌱",
    color:      "bg-sage-50 border-sage-200",
    quoteColor: "text-sage-500",
    stars:      5,
    tag:        "Mood Journal",
  },
  {
    quote:
      "Waktu aku benar-benar di titik terendah, tombol SOS di RuangTeduh yang menghubungkan aku ke hotline. Sekarang aku sudah jauh lebih baik. Terima kasih sudah hadir di waktu yang tepat.",
    author:     "Pengguna Anonim",
    role:       "Pekerja, 28 tahun",
    emoji:      "💚",
    color:      "bg-lavender-50 border-lavender-200",
    quoteColor: "text-lavender-400",
    stars:      5,
    tag:        "Crisis SOS",
  },
  {
    quote:
      "Ruang Cerita jadi tempatku berbagi tanpa takut dihakimi. Ada banyak orang di sana yang ternyata merasakan hal yang sama. Aku nggak merasa sendirian lagi.",
    author:     "Pengguna Anonim",
    role:       "Ibu rumah tangga, 34 tahun",
    emoji:      "🫂",
    color:      "bg-peach-50 border-peach-200",
    quoteColor: "text-peach-400",
    stars:      5,
    tag:        "Komunitas",
  },
  {
    quote:
      "Guided breathing-nya benar-benar membantu saat panic attack menyerang di tengah rapat. 5 menit, dan aku bisa kembali tenang. Fitur sesederhana itu terasa seperti penyelamat.",
    author:     "Pengguna Anonim",
    role:       "Profesional, 31 tahun",
    emoji:      "🌬️",
    color:      "bg-sky-50 border-sky-200",
    quoteColor: "text-sky-400",
    stars:      5,
    tag:        "Breathing Exercise",
  },
];

const SWIPE_THRESHOLD = 50; /* px — minimum drag distance to trigger slide */

export default function TestimonialsSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active,     setActive]     = useState(0);
  const [direction,  setDirection]  = useState(1); /* 1 = forward, -1 = backward */
  const [isPaused,   setIsPaused]   = useState(false);

  const goTo = (next: number, dir: number) => {
    setDirection(dir);
    setActive(next);
  };
  const prev = () => goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, -1);
  const next = () => goTo((active + 1) % TESTIMONIALS.length,  1);

  /* Auto-advance every 4 s, pause on hover/focus */
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setDirection(1);
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isPaused]);

  /* Slide variants driven by direction */
  const slideVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <section id="testimonials" className="py-28 bg-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-12 fill-cream">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,0 L0,0 Z" />
        </svg>
      </div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-sage-50 blob-1 opacity-50" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-lavender-50 blob-2 opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-lavender-500 tracking-widest uppercase mb-3">
            Cerita Nyata
          </p>
          <h2 className="font-display text-4xl xl:text-5xl text-forest font-semibold leading-tight mb-4">
            Mereka Sudah Merasakan{" "}
            <span className="gradient-text">Perbedaannya</span>
          </h2>
          <p className="text-muted text-lg max-w-lg mx-auto">
            Setiap testimoni di bawah ini nyata — nama disamarkan atas
            permintaan pengguna untuk menjaga privasi.
          </p>
        </motion.div>

        {/* Desktop: 4 cards grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="hidden lg:grid grid-cols-4 gap-5"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5 }}
              className={`rounded-3xl border p-6 ${t.color} relative shadow-[0_2px_16px_-6px_rgba(45,74,53,0.08)] flex flex-col`}
            >
              <Quote className={`w-7 h-7 ${t.quoteColor} opacity-50 mb-4`} fill="currentColor" />
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-peach-400 text-peach-400" />
                ))}
              </div>
              <p className="text-sm text-forest leading-relaxed mb-6 italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl border border-white/80">
                  {t.emoji}
                </div>
                <div>
                  <p className="text-xs font-semibold text-forest">{t.author}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
              <span className="absolute top-5 right-5 text-[10px] font-semibold text-muted bg-white/70 border border-white rounded-full px-2.5 py-0.5">
                {t.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile: swipeable carousel */}
        <div
          className="lg:hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_THRESHOLD) next();
                  else if (info.offset.x > SWIPE_THRESHOLD) prev();
                }}
                className={`border p-7 cursor-grab active:cursor-grabbing select-none ${TESTIMONIALS[active].color} shadow-[0_4px_24px_-8px_rgba(45,74,53,0.1)]`}
                style={{ borderRadius: "1.5rem" }}
              >
                <Quote
                  className={`w-7 h-7 ${TESTIMONIALS[active].quoteColor} opacity-50 mb-4`}
                  fill="currentColor"
                />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-peach-400 text-peach-400" />
                  ))}
                </div>
                <p className="text-base text-forest leading-relaxed mb-6 italic">
                  &ldquo;{TESTIMONIALS[active].quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">
                    {TESTIMONIALS[active].emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-forest">{TESTIMONIALS[active].author}</p>
                    <p className="text-xs text-muted">{TESTIMONIALS[active].role}</p>
                  </div>
                </div>
                {/* Swipe hint */}
                <p className="text-[10px] text-muted mt-4 text-center opacity-60">
                  Geser untuk melihat lebih banyak →
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              aria-label="Sebelumnya"
              className="w-10 h-10 rounded-full bg-sage-100 hover:bg-sage-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-forest" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > active ? 1 : -1)}
                  aria-label={`Testimoni ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-6 bg-sage-500" : "w-1.5 bg-sage-200 hover:bg-sage-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Berikutnya"
              className="w-10 h-10 rounded-full bg-sage-100 hover:bg-sage-200 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-forest" />
            </button>
          </div>
        </div>

        {/* Anonymous note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-light mt-10"
        >
          🔒 Semua nama dan identitas disamarkan atas permintaan pengguna.
          RuangTeduh tidak pernah membagikan data pribadi.
        </motion.p>
      </div>
    </section>
  );
}
