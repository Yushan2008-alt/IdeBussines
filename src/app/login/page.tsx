"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, Sprout, ArrowRight, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapOAuthErrorMessage } from "@/lib/auth/oauth";
import { useLanguage } from "@/lib/i18n/context";

interface LoginCredentials {
  email:       string;
  password:    string;
  remember_me: boolean;
}

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<LoginCredentials>({
    email: "", password: "", remember_me: false,
  });
  const [showPw,    setShowPw]    = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const update = <K extends keyof LoginCredentials>(key: K, val: LoginCredentials[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError(t.auth.invalidEmail);
      return;
    }
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    });

    if (authError) {
      const msg =
        authError.message === "Invalid login credentials"
          ? t.auth.invalidCredentials
          : authError.message === "Email not confirmed"
          ? t.auth.emailNotConfirmed
          : authError.message;
      setError(msg);
      setIsLoading(false);
      return;
    }

    router.refresh();
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          skipBrowserRedirect: true,
        },
      });
      if (oauthError) {
        setError(mapOAuthErrorMessage(oauthError.message));
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setError(t.auth.invalidCredentials);
    } catch (err) {
      const message = err instanceof Error ? err.message : t.auth.invalidCredentials;
      setError(mapOAuthErrorMessage(message));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const miniQuotes = t.landing.testimonials.items;
  const miniQuoteEntries = [
    { text: miniQuotes.quote1[0], author: miniQuotes.quote1[2] },
    { text: miniQuotes.quote2[0], author: miniQuotes.quote2[2] },
  ];

  return (
    <div className="min-h-screen flex bg-cream overflow-hidden">

      {/* ══ LEFT BRANDING PANEL ══ */}
      <div
        className="hidden lg:flex lg:w-[46%] relative flex-col justify-between overflow-hidden p-12"
        style={{ background: "linear-gradient(145deg, #EFF5F1 0%, #F3F1FB 60%, #FDF6F1 100%)" }}
      >
        <motion.div
          className="absolute -top-28 -left-24 w-[400px] h-[400px] blob-1 bg-sage-200/60 pointer-events-none"
          animate={{ scale: [1, 1.07, 1], rotate: [0, 6, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-16 w-[320px] h-[320px] blob-2 bg-lavender-200/50 pointer-events-none"
          animate={{ scale: [1, 1.06, 1], rotate: [0, -8, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div
          className="absolute top-1/2 right-6 w-[180px] h-[180px] blob-3 bg-peach-100/50 pointer-events-none"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-2xl bg-sage-500 flex items-center justify-center shadow-[0_4px_14px_-4px_rgba(109,148,116,0.5)]">
              <Sprout className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-semibold text-forest">
              Ruang<span className="text-sage-600">Teduh</span>
            </span>
          </Link>
        </motion.div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-xs font-bold text-sage-600 tracking-[0.18em] uppercase mb-4"
            >
              {t.landing.stats.title}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.65 }}
              className="font-display text-3xl xl:text-[2.6rem] font-semibold text-forest leading-snug mb-4"
            >
              {t.landing.hero.tagline.split("{word}")[0]}
              <br />
              <span className="gradient-text">{t.landing.hero.tagline.split("{word}")[1]}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-muted text-[15px] leading-relaxed max-w-sm"
            >
              {t.landing.hero.description}
            </motion.p>
          </div>

          {/* Mini testimonial cards */}
          <div className="space-y-3">
            {miniQuoteEntries.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.18, duration: 0.55 }}
                className="glass rounded-[1.5rem] px-5 py-4 max-w-sm"
              >
                <p className="text-forest text-sm font-medium leading-relaxed mb-2 italic">
                  &ldquo;{q.text}&rdquo;
                </p>
                <p className="text-muted text-xs font-semibold">— {q.author}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="flex -space-x-2">
            {["🧘", "💚", "🌿", "✨"].map((e, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-white border-2 border-sage-50 flex items-center justify-center text-sm shadow-sm"
              >
                {e}
              </div>
            ))}
          </div>
          <p className="text-muted text-sm leading-snug">
            <span className="font-bold text-forest">{t.landing.hero.trusted}</span>
            <br />
            {t.landing.hero.communityMembers}
          </p>
        </motion.div>
      </div>

      {/* ══ RIGHT FORM PANEL ══ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2.5 mb-10 justify-center"
          >
            <div className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold text-forest">
              Ruang<span className="text-sage-600">Teduh</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-forest mb-2 leading-tight">
              {t.landing.hero.greeting}
            </h1>
            <p className="text-muted text-base">
              {t.landing.hero.journalToday}
            </p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden mb-5"
              >
                <div className="bg-peach-50 border border-peach-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-peach-500 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-forest mb-1.5 block">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="kamu@email.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-2xl text-sm text-forest placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-300 transition-all font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-forest mb-1.5 block">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-border rounded-2xl text-sm text-forest placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-300 transition-all font-medium shadow-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => update("remember_me", !form.remember_me)}
                className="flex items-center gap-2.5 group"
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    form.remember_me
                      ? "bg-sage-500 border-sage-500"
                      : "border-border group-hover:border-sage-300"
                  }`}
                >
                  {form.remember_me && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <span className="text-sm text-muted font-medium">{t.auth.rememberMe}</span>
              </button>
              <Link
                href="/forgot-password"
                className="text-sm text-sage-600 font-semibold hover:text-sage-700 transition-colors"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -1 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
              className="w-full bg-sage-500 hover:bg-sage-600 disabled:bg-muted-light disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-[0_6px_20px_-6px_rgba(109,148,116,0.45)] hover:shadow-[0_8px_28px_-6px_rgba(109,148,116,0.55)] flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {t.auth.login}...
                </>
              ) : (
                <>
                  {t.auth.login} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-light font-semibold uppercase tracking-widest">
              {t.auth.login}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth button */}
          <motion.button
            onClick={handleGoogle}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 border border-border bg-white py-3.5 rounded-2xl font-semibold text-sm text-forest hover:bg-sage-50 hover:border-sage-200 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-bold flex items-center justify-center shrink-0 leading-none">
              G
            </div>
            {isGoogleLoading ? `${t.auth.login}...` : `${t.auth.login} Google`}
          </motion.button>

          {/* Register link */}
          <p className="text-center text-sm text-muted mt-8">
            {t.auth.noAccount}{" "}
            <Link
              href="/register"
              className="text-sage-600 font-bold hover:text-sage-700 transition-colors"
            >
              {t.auth.freeRegister} →
            </Link>
          </p>

          {/* Crisis footer */}
          <div className="mt-6 py-4 px-5 bg-peach-50/60 border border-peach-100 rounded-2xl text-center">
            <p className="text-xs text-muted leading-relaxed">
              {t.common.crisis.crisisNow}{" "}
              <a
                href="tel:119"
                className="text-peach-500 font-bold hover:underline"
              >
                119 ext 8
              </a>{" "}
              · {t.common.crisis.hotline}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
