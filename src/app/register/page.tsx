"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, Sprout,
  ArrowRight, ArrowLeft, Check, User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapOAuthErrorMessage } from "@/lib/auth/oauth";

/* ══════════════════════════════════════════════════════════
   SUPABASE-READY TYPES  (PRD Bagian 7 — Data Model)
══════════════════════════════════════════════════════════ */

/** Reflects: Supabase auth.users + public.users table */
interface RegisterForm {
  full_name:        string;    // → public.users.full_name
  email:            string;    // → auth.users.email
  password:         string;    // → auth.users (hashed by Supabase)
  confirm_password: string;    // UI validation only — NOT stored
  goals:            string[];  // → public.users.onboarding_goals (jsonb)
}

interface FormErrors {
  full_name?:        string;
  email?:            string;
  password?:         string;
  confirm_password?: string;
  goals?:            string;
}

interface GoalOption {
  id:          string;
  emoji:       string;
  label:       string;
  description: string;
  base:        string;
  active:      string;
}

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "anxiety", emoji: "😮‍💨", label: "Kelola Kecemasan", description: "Atasi stres & kekhawatiran harian",
    base:   "bg-lavender-50  border-lavender-100 hover:bg-lavender-100",
    active: "bg-lavender-100 border-lavender-400 ring-2 ring-lavender-100",
  },
  {
    id: "grief", emoji: "💔", label: "Masa-Masa Sulit", description: "Duka, kehilangan, atau trauma",
    base:   "bg-peach-50  border-peach-100 hover:bg-peach-100",
    active: "bg-peach-100 border-peach-400 ring-2 ring-peach-100",
  },
  {
    id: "mindfulness", emoji: "🧘", label: "Mindfulness", description: "Latihan napas & grounding harian",
    base:   "bg-mint-50  border-mint-100 hover:bg-mint-100",
    active: "bg-mint-100 border-sage-400 ring-2 ring-sage-100",
  },
  {
    id: "community", emoji: "💬", label: "Komunitas", description: "Berbagi tanpa penghakiman",
    base:   "bg-sky-50  border-sky-100 hover:bg-sky-100",
    active: "bg-sky-100 border-sky-400 ring-2 ring-sky-100",
  },
  {
    id: "safety", emoji: "🛡️", label: "Safety Plan", description: "Rencana keselamatan pribadi",
    base:   "bg-sage-50  border-sage-100 hover:bg-sage-100",
    active: "bg-sage-100 border-sage-500 ring-2 ring-sage-100",
  },
  {
    id: "consultation", emoji: "👩‍⚕️", label: "Konsultasi", description: "Terhubung ke psikolog berlisensi",
    base:   "bg-lavender-50  border-lavender-100 hover:bg-lavender-100",
    active: "bg-lavender-100 border-lavender-400 ring-2 ring-lavender-100",
  },
] as const;

const STEP_LABELS = ["Akun", "Tujuan", "Selamat!"] as const;

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
interface PasswordStrength {
  score:     0 | 1 | 2 | 3;
  label:     string;
  barColor:  string;
  textColor: string;
}

function getPasswordStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: "", barColor: "", textColor: "" };
  let s = 0;
  if (pw.length >= 8)             s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9!@#$%^&*]/.test(pw)) s++;
  if (s === 1) return { score: 1, label: "Lemah",  barColor: "bg-peach-400", textColor: "text-peach-400" };
  if (s === 2) return { score: 2, label: "Cukup",  barColor: "bg-sky-400",   textColor: "text-sky-500"   };
  return              { score: 3, label: "Kuat 💪", barColor: "bg-sage-500",  textColor: "text-sage-600"  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENT: Step Indicator
══════════════════════════════════════════════════════════ */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEP_LABELS.map((label, i) => {
        const step   = i + 1;
        const done   = step < current;
        const active = step === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: done || active ? "#6D9474" : "#E2EDE3",
                  scale:           active ? 1.18 : 1,
                  boxShadow:       active
                    ? "0 0 0 6px rgba(109,148,116,0.15)"
                    : "none",
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
              >
                {done ? (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                ) : (
                  <span className={`text-xs font-bold ${active ? "text-white" : "text-muted"}`}>
                    {step}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[10px] font-semibold mt-1.5 transition-colors ${
                  active ? "text-sage-600" : done ? "text-sage-500" : "text-muted-light"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <motion.div
                className="h-px w-12 md:w-20 mx-1 mb-4 rounded-full"
                animate={{ backgroundColor: step < current ? "#6D9474" : "#E2EDE3" }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENT: Password Strength Bar
══════════════════════════════════════════════════════════ */
function PasswordStrengthBar({ password }: { password: string }) {
  const s = getPasswordStrength(password);
  if (!password) return null;
  return (
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
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 1: Account Info
══════════════════════════════════════════════════════════ */
interface Step1Props {
  form:       RegisterForm;
  errors:     FormErrors;
  showPw:     boolean;
  showCPw:    boolean;
  setShowPw:  (v: boolean) => void;
  setShowCPw: (v: boolean) => void;
  update:     <K extends keyof RegisterForm>(key: K, val: RegisterForm[K]) => void;
  clearError: (key: keyof FormErrors) => void;
  onNext:     () => void;
  onGoogle:   () => void;
  isGoogleLoading: boolean;
}

function Step1({
  form, errors, showPw, showCPw,
  setShowPw, setShowCPw, update, clearError, onNext, onGoogle, isGoogleLoading,
}: Step1Props) {
  const inputClass = (errKey: keyof FormErrors, extra = "") =>
    `w-full py-3.5 bg-white border rounded-2xl text-sm text-forest placeholder:text-muted-light focus:outline-none focus:ring-2 transition-all font-medium shadow-sm ${extra} ${
      errors[errKey]
        ? "border-peach-300 focus:ring-peach-100"
        : "border-border focus:ring-sage-200 focus:border-sage-300"
    }`;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(45,74,53,0.1)] border border-border/50">
      <h1 className="font-display text-2xl font-semibold text-forest mb-1">
        Buat Akunmu 🌱
      </h1>
      <p className="text-muted text-sm mb-7">
        Gratis selamanya. Tidak ada kartu kredit yang dibutuhkan.
      </p>

      <div className="space-y-4">
        {/* Full name */}
        <div>
          <label className="text-sm font-semibold text-forest mb-1.5 block">
            Nama Lengkap
          </label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => { update("full_name", e.target.value); clearError("full_name"); }}
              placeholder="Nama panggilanmu"
              autoComplete="name"
              className={inputClass("full_name", "pl-11 pr-4")}
            />
          </div>
          {errors.full_name && (
            <p className="text-[11px] text-peach-500 mt-1.5 font-medium">{errors.full_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-forest mb-1.5 block">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => { update("email", e.target.value); clearError("email"); }}
              placeholder="kamu@email.com"
              autoComplete="email"
              className={inputClass("email", "pl-11 pr-4")}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-peach-500 mt-1.5 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-semibold text-forest mb-1.5 block">
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => { update("password", e.target.value); clearError("password"); }}
              placeholder="Min. 8 karakter"
              autoComplete="new-password"
              className={inputClass("password", "pl-11 pr-12")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={form.password} />
          {errors.password && (
            <p className="text-[11px] text-peach-500 mt-1.5 font-medium">{errors.password}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-sm font-semibold text-forest mb-1.5 block">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type={showCPw ? "text" : "password"}
              value={form.confirm_password}
              onChange={(e) => { update("confirm_password", e.target.value); clearError("confirm_password"); }}
              placeholder="Ulangi kata sandi"
              autoComplete="new-password"
              className={inputClass("confirm_password", "pl-11 pr-12")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCPw(!showCPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
            >
              {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-[11px] text-peach-500 mt-1.5 font-medium">{errors.confirm_password}</p>
          )}
        </div>

        {/* Next button */}
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-sage-500 hover:bg-sage-600 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_6px_20px_-6px_rgba(109,148,116,0.45)] flex items-center justify-center gap-2 mt-2"
        >
          Lanjutkan <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-light font-semibold uppercase tracking-wider">atau</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google */}
        <motion.button
          onClick={onGoogle}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 border border-border bg-white py-3.5 rounded-2xl font-semibold text-sm text-forest hover:bg-sage-50 hover:border-sage-200 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            G
          </div>
          {isGoogleLoading ? "Memproses Google..." : "Daftar dengan Google"}
        </motion.button>

        <p className="text-center text-xs text-muted-light leading-relaxed">
          Dengan mendaftar, kamu menyetujui{" "}
          <a href="#" className="text-sage-600 font-semibold hover:underline">Kebijakan Privasi</a>{" "}
          dan{" "}
          <a href="#" className="text-sage-600 font-semibold hover:underline">Syarat Layanan</a>{" "}
          kami.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 2: Goal Selection
══════════════════════════════════════════════════════════ */
interface Step2Props {
  form:       RegisterForm;
  errors:     FormErrors;
  toggleGoal: (id: string) => void;
  onBack:     () => void;
  onSubmit:   () => void;
  isLoading:  boolean;
}

function Step2({ form, errors, toggleGoal, onBack, onSubmit, isLoading }: Step2Props) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(45,74,53,0.1)] border border-border/50">
      <h2 className="font-display text-2xl font-semibold text-forest mb-1">
        Mengapa kamu di sini? 💭
      </h2>
      <p className="text-muted text-sm mb-7 leading-relaxed">
        Pilih yang paling mewakili tujuanmu.{" "}
        <span className="text-sage-600 font-semibold">Boleh lebih dari satu.</span>
      </p>

      {/* Goal grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {GOAL_OPTIONS.map((goal) => {
          const isActive = form.goals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`relative p-4 rounded-[1.5rem] border text-left transition-all duration-200 ${
                isActive ? goal.active : goal.base
              }`}
            >
              {/* Check badge */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{   scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute top-2.5 right-2.5 w-5 h-5 bg-sage-500 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-2xl block mb-2">{goal.emoji}</span>
              <p className="font-semibold text-xs text-forest leading-tight">{goal.label}</p>
              <p className="text-muted-light text-[10px] mt-0.5 leading-tight">{goal.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Goal error */}
      <AnimatePresence>
        {errors.goals && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-peach-500 font-medium mb-4 text-center"
          >
            {errors.goals}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-border text-muted font-semibold text-sm hover:bg-sage-50 hover:text-forest transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </motion.button>
        <motion.button
          onClick={onSubmit}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 bg-sage-500 hover:bg-sage-600 disabled:bg-muted-light disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all shadow-[0_6px_20px_-6px_rgba(109,148,116,0.45)] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Membuat akun...
            </>
          ) : (
            <>Daftar Sekarang ✨</>
          )}
        </motion.button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 3: Welcome Screen
══════════════════════════════════════════════════════════ */
function Step3({ fullName }: { fullName: string }) {
  const router = useRouter();
  return (
    <div className="text-center py-6 px-4">
      {/* Animated orb */}
      <div className="relative w-36 h-36 mx-auto mb-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-[2rem] bg-sage-400/20"
            animate={{ scale: [1, 1.9 + i * 0.35], opacity: [0.6, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay:   i * 0.55,
              ease:    "easeOut",
            }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
          className="w-36 h-36 bg-sage-500 rounded-[2rem] flex items-center justify-center shadow-[0_16px_48px_-8px_rgba(109,148,116,0.55)]"
        >
          <Sprout className="w-16 h-16 text-white" strokeWidth={1.5} />
        </motion.div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="font-display text-3xl font-semibold text-forest mb-3 leading-tight"
      >
        Selamat Datang,
        <br />
        {fullName || "Teman Baru"}! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-muted text-base leading-relaxed max-w-xs mx-auto mb-10"
      >
        Ruangmu sudah siap. Ini adalah langkah yang berani, dan kami
        bangga kamu sudah sampai di sini.
      </motion.p>

      <motion.button
        onClick={() => router.push("/dashboard")}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2.5 bg-sage-500 hover:bg-sage-600 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-[0_6px_24px_-6px_rgba(109,148,116,0.5)] hover:shadow-[0_8px_28px_-6px_rgba(109,148,116,0.6)]"
      >
        Mulai Perjalananmu <ArrowRight className="w-4 h-4" />
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-xs text-muted-light mt-8 leading-relaxed"
      >
        Butuh bantuan segera?{" "}
        <a href="tel:119" className="text-peach-500 font-bold hover:underline">
          119 ext 8
        </a>{" "}
        · Into The Light, 24 jam.
      </motion.p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP ANIMATION VARIANTS
══════════════════════════════════════════════════════════ */
const stepVariants = {
  enter:  (d: number) => ({ x: d > 0 ? "55%"  : "-55%",  opacity: 0, scale: 0.97 }),
  center: {               x: 0,                           opacity: 1, scale: 1    },
  exit:   (d: number) => ({ x: d > 0 ? "-55%" : "55%",   opacity: 0, scale: 0.97 }),
} as import("framer-motion").Variants;

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const supabase = createClient();

  const [step,      setStep]      = useState(1);
  const [direction, setDirection] = useState(1);
  const [form,      setForm]      = useState<RegisterForm>({
    full_name: "", email: "", password: "", confirm_password: "", goals: [],
  });
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [showPw,    setShowPw]    = useState(false);
  const [showCPw,   setShowCPw]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  /* ── Helpers ── */
  const update = <K extends keyof RegisterForm>(key: K, val: RegisterForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const clearError = (key: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  /* ── Step 1 validation ── */
  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!form.full_name.trim())                    e.full_name        = "Nama wajib diisi.";
    if (!isValidEmail(form.email))                 e.email            = "Format email tidak valid.";
    if (form.password.length < 8)                  e.password         = "Kata sandi minimal 8 karakter.";
    if (form.password !== form.confirm_password)   e.confirm_password = "Kata sandi tidak cocok.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) goTo(2);
  };

  /* ── Step 2 submit — Supabase sign-up ── */
  const handleRegister = async () => {
    if (form.goals.length === 0) {
      setErrors({ goals: "Pilih setidaknya satu tujuan untuk melanjutkan." });
      return;
    }
    setIsLoading(true);
    setErrors({});

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (authError) {
      const msg =
        authError.message === "User already registered"
          ? "Email ini sudah terdaftar. Silakan masuk."
          : authError.message;
      setErrors({ goals: msg });
      setIsLoading(false);
      return;
    }

    const userId = authData.user?.id;

    // 2. Insert user profile row into public.users
    // (The DB trigger also handles this as a fallback)
    if (userId) {
      await supabase.from("users").upsert({
        id:               userId,
        full_name:        form.full_name,
        avatar_url:       null,
        role:             "user",
        is_anonymous:     true,
        joined_at:        new Date().toISOString(),
        onboarding_goals: form.goals,
      }, { onConflict: "id" });
    }

    setIsLoading(false);
    goTo(3);
  };

  const toggleGoal = (id: string) => {
    const next = form.goals.includes(id)
      ? form.goals.filter((g) => g !== id)
      : [...form.goals, id];
    update("goals", next);
    if (errors.goals) clearError("goals");
  };

  /* ── Google OAuth sign-up ── */
  const handleGoogle = async () => {
    setErrors((prev) => ({ ...prev, full_name: undefined }));
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
        setErrors({ full_name: mapOAuthErrorMessage(oauthError.message) });
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setErrors({ full_name: "Gagal memulai autentikasi Google. Coba lagi beberapa saat." });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghubungkan dengan Google. Pastikan pop-up tidak diblokir, lalu coba lagi atau daftar dengan email.";
      setErrors({ full_name: mapOAuthErrorMessage(message) });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background blobs */}
      <motion.div
        className="absolute -top-36 -right-28 w-[420px] h-[420px] blob-1 bg-lavender-100/60 pointer-events-none"
        animate={{ scale: [1, 1.06, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -left-24 w-[360px] h-[360px] blob-2 bg-sage-100/50 pointer-events-none"
        animate={{ scale: [1, 1.07, 1], rotate: [0, -6, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/3 -right-12 w-[200px] h-[200px] blob-3 bg-peach-100/40 pointer-events-none"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Top nav */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center shadow-[0_4px_14px_-4px_rgba(109,148,116,0.45)] transition-transform group-hover:scale-105">
            <Sprout className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold text-forest">
            Ruang<span className="text-sage-600">Teduh</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="text-sm text-muted font-semibold hover:text-forest transition-colors"
        >
          Sudah punya akun? <span className="text-sage-600">Masuk</span>
        </Link>
      </div>

      {/* Step content */}
      <div className="w-full max-w-lg relative z-10">
        <StepIndicator current={step} />

        <div className="overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 1 && (
                <Step1
                  form={form}
                  errors={errors}
                  showPw={showPw}
                  showCPw={showCPw}
                  setShowPw={setShowPw}
                  setShowCPw={setShowCPw}
                  update={update}
                  clearError={clearError}
                  onNext={handleNext}
                  onGoogle={handleGoogle}
                  isGoogleLoading={isGoogleLoading}
                />
              )}
              {step === 2 && (
                <Step2
                  form={form}
                  errors={errors}
                  toggleGoal={toggleGoal}
                  onBack={() => goTo(1)}
                  onSubmit={handleRegister}
                  isLoading={isLoading}
                />
              )}
              {step === 3 && (
                <Step3 fullName={form.full_name} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom link — only show on steps 1 & 2 */}
        {step < 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-muted mt-6"
          >
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-sage-600 font-bold hover:text-sage-700 transition-colors"
            >
              Masuk sekarang
            </Link>
          </motion.p>
        )}

        {/* Crisis footer */}
        {step < 3 && (
          <p className="text-center text-xs text-muted-light mt-4">
            Dalam krisis?{" "}
            <a href="tel:119" className="text-peach-500 font-semibold hover:underline">
              119 ext 8
            </a>{" "}
            · Into The Light · 24 jam
          </p>
        )}
      </div>
    </div>
  );
}
