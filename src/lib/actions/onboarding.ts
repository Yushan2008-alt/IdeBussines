'use server';

/**
 * RuangTeduh — Onboarding Server Actions
 * Table: public.user_preferences
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CompleteOnboardingSchema = z.object({
  nickname: z.string().min(1).max(32),
  age_confirmed_13_plus: z.literal(true), // must be true to proceed
  stress_triggers: z.array(z.string().max(50)).max(10),
  goals: z.array(z.string().max(50)).max(5),
  preferred_checkin_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/) // HH:MM
    .optional(),
  has_crisis_history: z.boolean(),
});

export type CompleteOnboardingInput = z.infer<typeof CompleteOnboardingSchema>;

export interface CompleteOnboardingResult {
  success: boolean;
  shouldShowSafetyGate: boolean; // true if user disclosed crisis history
  error?: string;
}

export async function completeOnboarding(
  input: unknown
): Promise<CompleteOnboardingResult> {
  const parsed = CompleteOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, shouldShowSafetyGate: false, error: 'Input tidak valid' };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { success: false, shouldShowSafetyGate: false, error: 'Unauthorized' };
  }

  const { error } = await supabase.from('user_preferences').upsert({
    user_id: auth.user.id,
    nickname: data.nickname,
    age_confirmed_13_plus: true,
    stress_triggers: data.stress_triggers,
    goals: data.goals,
    preferred_checkin_time: data.preferred_checkin_time ?? null,
    has_crisis_history: data.has_crisis_history,
    onboarding_completed: true,
  });

  if (error) {
    return {
      success: false,
      shouldShowSafetyGate: false,
      error: 'Gagal menyimpan preferensi',
    };
  }

  // If crisis history disclosed → log it for safety audit
  if (data.has_crisis_history) {
    await supabase.from('crisis_logs').insert({
      user_id: auth.user.id,
      severity: 'low',
      trigger_source: 'onboarding_disclosure',
    });
  }

  return {
    success: true,
    shouldShowSafetyGate: data.has_crisis_history,
  };
}

export async function getOnboardingStatus(): Promise<{ completed: boolean }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { completed: false };

  const { data } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  return { completed: data?.onboarding_completed ?? false };
}
