'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const HIDDEN_ROUTES = ['/', '/login', '/register', '/auth'];

export function CrisisFAB() {
  const pathname = usePathname();
  const shouldHide = HIDDEN_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (shouldHide) return null;

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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 ring-4 ring-red-600/20 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400"
      >
        <span className="text-2xl" aria-hidden>🆘</span>
      </Link>
      <span className="sr-only">Tombol bantuan darurat</span>
    </motion.div>
  );
}
