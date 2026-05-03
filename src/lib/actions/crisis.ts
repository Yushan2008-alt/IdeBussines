'use server';

/**
 * RuangTeduh — Crisis Log Server Actions
 * Table: public.crisis_logs
 * Append-only — no UPDATE/DELETE.
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const LogCrisisSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']),
  trigger_source: z.enum([
    'manual_button',
    'bot_keyword',
    'mood_pattern_3day',
    'onboarding_disclosure',
  ]),
  matched_keywords: z.array(z.string()).max(20).optional(),
  hotline_clicked: z.string().max(50).optional(),
});

export interface LogCrisisResult {
  success: boolean;
  logId?: string;
}

/**
 * Append-only crisis log. Fire-and-forget from client (do not block UI on this).
 */
export async function logCrisisEvent(input: unknown): Promise<LogCrisisResult> {
  const parsed = LogCrisisSchema.safeParse(input);
  if (!parsed.success) return { success: false };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false };

  const { data, error } = await supabase
    .from('crisis_logs')
    .insert({
      user_id: auth.user.id,
      severity: parsed.data.severity,
      trigger_source: parsed.data.trigger_source,
      matched_keywords: parsed.data.matched_keywords ?? null,
      hotline_clicked: parsed.data.hotline_clicked ?? null,
    })
    .select('id')
    .single();

  if (error || !data) return { success: false };
  return { success: true, logId: data.id };
}

export async function getActiveHotlines() {
  return [
    {
      id: 'into-the-light',
      name: 'Into The Light Indonesia',
      phone: '119',
      ext: '8',
      hours: '24 jam',
      tel_link: 'tel:119',
      description: 'Hotline pencegahan bunuh diri nasional',
    },
    {
      id: 'yayasan-pulih',
      name: 'Yayasan Pulih',
      phone: '021-78842580',
      hours: 'Senin–Jumat, 09:00–17:00 WIB',
      tel_link: 'tel:+62217884258',
      description: 'Dukungan psikologis untuk korban kekerasan & trauma',
    },
    {
      id: 'sejiwa',
      name: 'SEJIWA',
      phone: '119',
      hours: '24 jam',
      tel_link: 'tel:119',
      description: 'Layanan dukungan psikologis Kemenkes RI',
    },
  ];
}
