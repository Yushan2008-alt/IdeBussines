'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, Heart } from 'lucide-react';

export function CrisisBanner({ severity }: { severity: 'medium' | 'high' }) {
  if (severity === 'high') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        role="alert"
        className="rounded-[2rem] bg-gradient-to-br from-peach-50 to-peach-100 p-5 border border-peach-200 shadow-[0_4px_20px_-8px_rgba(217,143,96,0.15)]"
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.2rem] bg-peach-400 border border-peach-300"
          >
            <Heart className="h-5 w-5 text-white fill-white" />
          </motion.div>
          <div className="flex-1">
            <p className="font-semibold text-peach-700 text-sm">Aku khawatir dengan kamu.</p>
            <p className="mt-0.5 text-sm text-peach-600 leading-relaxed">
              Tolong hubungi seseorang yang bisa membantu sekarang.
            </p>
            <Link
              href="/bantuan?source=bot&severity=high"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-peach-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-peach-600 transition-all shadow-[0_4px_14px_-4px_rgba(217,143,96,0.5)]"
            >
              <Phone className="h-4 w-4" />
              Lihat Hotline Sekarang
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      role="alert"
      className="rounded-[2rem] bg-gradient-to-br from-lavender-50 to-sky-50 p-5 border border-lavender-100 shadow-[0_4px_20px_-8px_rgba(165,145,204,0.1)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.2rem] bg-lavender-200 border border-lavender-100">
          <Phone className="h-5 w-5 text-lavender-500" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lavender-700 text-sm">Kamu sedang merasa berat ya.</p>
          <p className="mt-0.5 text-sm text-lavender-600 leading-relaxed">
            Mau coba bicara dengan seseorang? Ada yang siap mendengarkanmu.
          </p>
          <Link
            href="/bantuan?source=bot&severity=medium"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-lavender-400 px-5 py-2.5 text-sm font-bold text-white hover:bg-lavender-500 transition-all shadow-[0_4px_14px_-4px_rgba(165,145,204,0.5)]"
          >
            <Phone className="h-4 w-4" />
            Lihat Opsi Bantuan
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
