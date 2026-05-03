'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { completeOnboarding } from '@/lib/actions/onboarding';
import { Step1Welcome } from './steps/Step1Welcome';
import { Step2Nickname } from './steps/Step2Nickname';
import { Step3Triggers } from './steps/Step3Triggers';
import { Step4Goals } from './steps/Step4Goals';
import { Step5Safety } from './steps/Step5Safety';

export interface OnboardingState {
  nickname: string;
  stress_triggers: string[];
  goals: string[];
  preferred_checkin_time?: string;
  has_crisis_history: boolean;
  age_confirmed_13_plus: boolean;
}

const INITIAL: OnboardingState = {
  nickname: '',
  stress_triggers: [],
  goals: [],
  has_crisis_history: false,
  age_confirmed_13_plus: false,
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<OnboardingState>) => setData((d) => ({ ...d, ...patch }));

  const handleSubmit = async () => {
    if (!data.age_confirmed_13_plus) {
      setError('Kamu harus berusia 13 tahun atau lebih untuk menggunakan RuangTeduh.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await completeOnboarding(data);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Terjadi kesalahan. Coba lagi.');
      return;
    }

    if (result.shouldShowSafetyGate) {
      router.replace('/bantuan?source=onboarding&severity=low');
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-md">
        {/* Progress */}
        <div className="mb-6 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                s <= step ? 'bg-blue-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <Step1Welcome onNext={() => setStep(2)} />}
            {step === 2 && (
              <Step2Nickname
                value={data.nickname}
                ageConfirmed={data.age_confirmed_13_plus}
                onChange={(nickname, age_confirmed_13_plus) =>
                  update({ nickname, age_confirmed_13_plus })
                }
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <Step3Triggers
                value={data.stress_triggers}
                onChange={(stress_triggers) => update({ stress_triggers })}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <Step4Goals
                value={data.goals}
                onChange={(goals) => update({ goals })}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <Step5Safety
                value={data.has_crisis_history}
                onChange={(has_crisis_history) => update({ has_crisis_history })}
                onSubmit={handleSubmit}
                onBack={() => setStep(4)}
                submitting={submitting}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-600/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
