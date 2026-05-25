'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function CrisisFAB() {

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="fixed bottom-20 right-4 z-50 md:bottom-6"
    >
      <Link
        href="/bantuan?source=fab"
        aria-label="Butuh bantuan segera"
        className="group relative flex h-14 w-14 items-center justify-center"
      >
        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-full bg-peach-300"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute inset-0 rounded-full bg-peach-200"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />

        {/* Main button */}
        <motion.div
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-peach-400 to-peach-500 text-white shadow-[0_8px_32px_-8px_rgba(217,143,96,0.6)] ring-4 ring-peach-200/60"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <motion.span
            className="text-xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            aria-hidden
          >
            📞
          </motion.span>
        </motion.div>

        {/* Label - muncul di hover */}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-forest/90 px-3 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:-top-9">
          Butuh Bantuan?
        </span>
      </Link>
      <span className="sr-only">Tombol bantuan darurat kesehatan mental</span>
    </motion.div>
  );
}
