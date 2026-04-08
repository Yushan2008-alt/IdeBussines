"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Menu, X, ArrowRight, Phone } from "lucide-react";

const NAV_LINKS = [
  { label: "Fitur",     href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Komunitas", href: "#testimonials" },
  { label: "Tentang",   href: "#about" },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu on resize ≥ lg */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass shadow-[0_4px_32px_-8px_rgba(45,74,53,0.10)]"
            : "bg-transparent"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                className="w-9 h-9 rounded-2xl bg-sage-500 flex items-center justify-center shadow-[0_4px_14px_-4px_rgba(109,148,116,0.5)]"
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sprout className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </motion.div>
              <span className="font-display text-xl font-semibold text-forest">
                Ruang<span className="text-sage-600">Teduh</span>
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-muted hover:text-forest transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-sage-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                </Link>
              ))}
            </nav>

            {/* ── Desktop CTA Buttons ── */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/dashboard">
                <motion.button
                  className="px-5 py-2.5 text-sm font-semibold text-forest hover:text-sage-700 border border-border hover:border-sage-400 rounded-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Masuk
                </motion.button>
              </Link>
              <Link href="/dashboard">
                <motion.button
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sage-500 hover:bg-sage-600 rounded-xl shadow-[0_4px_16px_-4px_rgba(109,148,116,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(109,148,116,0.6)] transition-all duration-200"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Daftar Gratis
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>

            {/* ── Mobile Hamburger ── */}
            <motion.button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-sage-50 text-forest transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              whileTap={{ scale: 0.92 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate: 90,  opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile Menu Drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="lg:hidden glass border-t border-white/60"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{   height: 0,    opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-2">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0,   opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-forest font-medium hover:bg-sage-50 transition-colors"
                    >
                      {link.label}
                      <ArrowRight className="w-4 h-4 text-muted-light" />
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                  {/* Crisis hotline shortcut on mobile */}
                  <a
                    href="tel:119"
                    className="flex items-center gap-3 px-4 py-3 bg-peach-50 border border-peach-200 rounded-xl text-sm font-medium text-forest"
                  >
                    <div className="w-8 h-8 rounded-lg bg-peach-200 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-peach-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Butuh Bantuan Darurat?</p>
                      <p className="text-muted text-xs">Hotline: 119 ext 8</p>
                    </div>
                  </a>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 text-sm font-semibold text-white bg-sage-500 rounded-xl">
                      Daftar Gratis — 100% Gratis
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Overlay behind mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-forest/10 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
