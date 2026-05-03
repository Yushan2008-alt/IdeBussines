'use client';

interface Props {
  onNext: () => void;
}

export function Step1Welcome({ onNext }: Props) {
  return (
    <section aria-labelledby="step1-heading">
      <p className="text-4xl text-center mb-6">🌿</p>
      <h2 id="step1-heading" className="text-2xl font-bold text-center">
        Halo! Selamat datang di RuangTeduh
      </h2>
      <p className="mt-3 text-sm text-slate-400 text-center leading-relaxed">
        Tempat aman untuk merawat kesehatan mentalmu — gratis, empatik, dan selalu ada.
        Butuh beberapa menit untuk mengenalmu lebih baik.
      </p>

      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
          <span className="text-xl">🔒</span>
          <p className="text-sm text-slate-300">Privasimu aman — datamu tidak dijual</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
          <span className="text-xl">💙</span>
          <p className="text-sm text-slate-300">Tidak ada penilaian di sini</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
          <span className="text-xl">⏱️</span>
          <p className="text-sm text-slate-300">Hanya 3–5 menit untuk setup</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-8 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Mulai →
      </button>
    </section>
  );
}
