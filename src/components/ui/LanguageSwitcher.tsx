"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleLang}
      aria-label={t.language.switchTo}
      className="fixed top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                 bg-white/80 backdrop-blur-sm border border-border shadow-sm
                 text-xs font-semibold text-muted hover:text-forest hover:border-sage-300
                 transition-all"
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="uppercase tracking-wider">{lang}</span>
    </motion.button>
  );
}
