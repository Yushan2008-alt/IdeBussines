'use client';

import { useEffect } from 'react';
import { logCrisisEvent } from '@/lib/actions/crisis';

interface Hotline {
  id: string;
  name: string;
  phone: string;
  ext?: string;
  hours: string;
  tel_link: string;
  description: string;
}

interface Props {
  hotlines: Hotline[];
  triggerSource: 'manual_button' | 'bot_keyword' | 'mood_pattern_3day';
  severity: 'low' | 'medium' | 'high';
  matchedKeywords?: string[];
}

export function CrisisScreen({ hotlines, triggerSource, severity, matchedKeywords }: Props) {
  // Log on mount (fire-and-forget)
  useEffect(() => {
    logCrisisEvent({ severity, trigger_source: triggerSource, matched_keywords: matchedKeywords })
      .catch(() => { /* silent — UI is the priority */ });
  }, [severity, triggerSource, matchedKeywords]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center">
          <p className="text-3xl" aria-hidden>💙</p>
          <h1 className="mt-3 text-2xl font-bold">Kamu tidak sendirian.</h1>
          <p className="mt-2 text-sm text-slate-400">
            Kalau kamu sedang merasa berat, ada orang yang siap mendengarkan kamu sekarang.
          </p>
        </header>

        <section aria-label="Daftar hotline">
          <ul className="space-y-3">
            {hotlines.map((h) => (
              <li key={h.id}>
                <a
                  href={h.tel_link}
                  onClick={() => {
                    logCrisisEvent({
                      severity,
                      trigger_source: triggerSource,
                      hotline_clicked: h.id,
                    }).catch(() => {});
                  }}
                  className="block rounded-2xl bg-red-600/10 p-4 ring-1 ring-red-600/30 transition hover:bg-red-600/20"
                >
                  <p className="text-lg font-semibold text-red-100">
                    📞 {h.name}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-red-200">
                    {h.phone}{h.ext ? ` ext ${h.ext}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{h.hours}</p>
                  <p className="mt-1 text-xs text-slate-300">{h.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl bg-slate-900 p-4">
          <h2 className="text-sm font-semibold text-slate-200">Sambil menunggu</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/breathing" className="rounded-xl bg-slate-800 p-3 text-center text-sm hover:bg-slate-700">
              🌬️ Tarik napas
            </a>
            <a href="/safety-plan" className="rounded-xl bg-slate-800 p-3 text-center text-sm hover:bg-slate-700">
              🛡️ Safety Plan
            </a>
          </div>
        </section>

        <p className="text-center text-xs text-slate-500">
          Hidupmu berharga. Tolong hubungi salah satu nomor di atas.
        </p>
      </div>
    </main>
  );
}
