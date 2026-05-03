'use client';

import Link from 'next/link';

export function CrisisBanner({ severity }: { severity: 'medium' | 'high' }) {
  if (severity === 'high') {
    return (
      <div role="alert" className="rounded-xl bg-red-600/15 p-4 ring-2 ring-red-600">
        <p className="font-semibold text-red-100">Aku khawatir dengan kamu.</p>
        <p className="mt-1 text-sm text-red-200">
          Tolong hubungi seseorang yang bisa membantu sekarang.
        </p>
        <Link
          href="/bantuan?source=bot"
          className="mt-3 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Lihat Hotline →
        </Link>
      </div>
    );
  }

  return (
    <div role="alert" className="rounded-xl bg-amber-500/10 p-4 ring-1 ring-amber-500/40">
      <p className="font-semibold text-amber-100">Kamu sedang merasa berat ya.</p>
      <p className="mt-1 text-sm text-amber-200">
        Mau coba bicara dengan seseorang?
      </p>
      <Link href="/bantuan" className="mt-2 inline-block text-sm text-amber-300 underline">
        Lihat opsi bantuan
      </Link>
    </div>
  );
}
