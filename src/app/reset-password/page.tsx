"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sprout, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error: userError }) => {
      if (userError || !data?.user) {
        router.push("/login");
      }
    });
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  function getPasswordStrength(pw: string) {
    if (!pw) return { score: 0, label: "", barColor: "", textColor: "" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9!@#$%^&*]/.test(pw)) s++;
    if (s === 1) return { score: 1, label: "Lemah", barColor: "bg-peach-400", textColor: "text-peach-400" };
    if (s === 2) return { score: 2, label: "Cukup", barColor: "bg-sky-400", textColor: "text-sky-500" };
    return { score: 3, label: "Kuat 💪", barColor: "bg-sage-500", textColor: "text-sage-600" };
  }

  const s = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex bg-cream overflow-hidden">
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

        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-xs font-bold text-sage-600 tracking-[0.18em] uppercase mb-4"
          >
            Hampir Selesai
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.65 }}
            className="font-display text-3xl xl:text-[2.6rem] font-semibold text-forest leading-snug mb-4"
          >
            Buat kata sandi baru.
            <br />
            <span className="gradient-text">Kuat dan aman.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted text-[15px] leading-relaxed max-w-sm"
          >
            Pastikan kata sandimu berbeda dari yang sebelumnya dan mudah
            kamu ingat.
          </motion.p>
        </div>

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
            <span className="font-bold text-forest">12.400+ jiwa</span>
            <br />
            sudah bergabung bersama kami
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
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

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-forest mb-2 leading-tight">
              Kata Sandi Baru 🔒
            </h1>
            <p className="text-muted text-base">
              Buat kata sandi yang kuat untuk akunmu.
            </p>
          </div>

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

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden mb-5"
              >
                <div className="bg-mint-50 border border-mint-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-sage-600 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Kata sandi berhasil diubah! Mengalihkan...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-semibold text-forest mb-1.5 block">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    autoComplete="new-password"
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
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-400 ${
                            n <= s.score ? s.barColor : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold ${s.textColor}`}>{s.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-forest mb-1.5 block">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    type={showCPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-border rounded-2xl text-sm text-forest placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-300 transition-all font-medium shadow-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCPw((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
                  >
                    {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

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
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Kata Sandi"
                )}
              </motion.button>
            </form>
          )}

          <p className="text-center text-sm text-muted mt-8">
            <Link
              href="/login"
              className="text-sage-600 font-bold hover:text-sage-700 transition-colors"
            >
              Kembali ke masuk
            </Link>
          </p>

          <div className="mt-6 py-4 px-5 bg-peach-50/60 border border-peach-100 rounded-2xl text-center">
            <p className="text-xs text-muted leading-relaxed">
              Dalam krisis sekarang?{" "}
              <a href="tel:119" className="text-peach-500 font-bold hover:underline">
                119 ext 8
              </a>{" "}
              · Into The Light Indonesia · 24 jam · Gratis
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
