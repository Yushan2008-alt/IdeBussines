"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sprout, Phone, Heart, Globe, Share2, Mail } from "lucide-react";

const LINKS = {
  Produk: [
    { label: "Mood Journal",     href: "/dashboard" },
    { label: "AI Companion",     href: "/dashboard" },
    { label: "Crisis SOS",       href: "/dashboard" },
    { label: "Ruang Cerita",     href: "/dashboard" },
    { label: "Guided Breathing", href: "/dashboard" },
    { label: "Safety Plan",      href: "/dashboard" },
  ],
  Dukungan: [
    { label: "Pusat Bantuan",   href: "#" },
    { label: "FAQ",             href: "#" },
    { label: "Kontak Tim",      href: "mailto:halo@ruangteduh.id" },
    { label: "Lapor Masalah",   href: "#" },
  ],
  "Tentang Kami": [
    { label: "Visi & Misi",     href: "#" },
    { label: "Tim RuangTeduh",  href: "#" },
    { label: "Blog",            href: "#" },
    { label: "Karir",           href: "#" },
  ],
};

const HOTLINES = [
  { label: "Into The Light: 119 ext 8",   href: "tel:119" },
  { label: "Yayasan Pulih: 021-788-42580", href: "tel:02178842580" },
];

export default function Footer() {
  return (
    <footer className="bg-forest text-cream relative overflow-hidden" role="contentinfo">

      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-12 fill-cream">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage-800 blob-2 opacity-30 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage-900 blob-1 opacity-20 translate-y-1/2 -translate-x-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-10">

        {/* Top: Logo + Emergency hotline */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 pb-16 border-b border-sage-700/50">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-6 group w-fit">
              <div className="w-10 h-10 rounded-2xl bg-sage-500 flex items-center justify-center group-hover:bg-sage-400 transition-colors">
                <Sprout className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-semibold text-cream">
                Ruang<span className="text-sage-300">Teduh</span>
              </span>
            </Link>
            <p className="text-sage-300 leading-relaxed mb-6 max-w-sm text-sm">
              Platform kesehatan mental 100% gratis yang hadir untuk menemanimu —
              dengan empati, tanpa penghakiman, kapan pun kamu membutuhkan.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: Globe,   label: "Website",  href: "#" },
                { icon: Share2,  label: "Share",    href: "#" },
                { icon: Mail,    label: "Email",    href: "mailto:halo@ruangteduh.id" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.a
                    key={i}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-sage-700/60 hover:bg-sage-600 flex items-center justify-center text-sage-300 hover:text-white transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Emergency box */}
          <div className="rounded-3xl bg-sage-800/60 border border-sage-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-9 h-9 rounded-xl bg-sage-500/30 flex items-center justify-center"
              >
                <Phone className="w-4 h-4 text-sage-300" />
              </motion.div>
              <div>
                <p className="font-semibold text-sm text-cream">Butuh Bantuan Darurat?</p>
                <p className="text-sage-400 text-xs">Hotline tersedia sekarang</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {HOTLINES.map((h, i) => (
                <a
                  key={i}
                  href={h.href}
                  className="text-sm text-sage-200 hover:text-white font-medium hover:underline transition-colors"
                >
                  📞 {h.label}
                </a>
              ))}
            </div>
            <p className="text-xs text-sage-400 mt-3">
              Jika dalam bahaya segera, hubungi <strong className="text-sage-200">112</strong> (darurat nasional)
            </p>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid sm:grid-cols-3 gap-10 mb-16">
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-bold tracking-widest uppercase text-sage-400 mb-4">
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-sage-300 hover:text-cream transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sage-700/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sage-400">
            © {new Date().getFullYear()} RuangTeduh · Dibuat dengan{" "}
            <Heart className="inline w-3 h-3 fill-sage-400 text-sage-400" /> untuk
            Indonesia
          </p>
          <div className="flex gap-5 text-xs text-sage-400">
            <Link href="#" className="hover:text-cream transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-cream transition-colors">Syarat Penggunaan</Link>
            <Link href="#" className="hover:text-cream transition-colors">Aksesibilitas</Link>
          </div>
        </div>

        {/* Mental health disclaimer */}
        <p className="text-[10px] text-sage-500 text-center mt-6 leading-relaxed max-w-2xl mx-auto">
          <strong>Penting:</strong> RuangTeduh bukan pengganti diagnosis atau perawatan profesional.
          Jika kamu mengalami krisis, segera hubungi hotline darurat atau profesional kesehatan jiwa terdekat.
        </p>
      </div>
    </footer>
  );
}
