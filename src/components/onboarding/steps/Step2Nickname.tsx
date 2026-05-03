'use client';

interface Props {
  value: string;
  ageConfirmed: boolean;
  onChange: (nickname: string, ageConfirmed: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Nickname({ value, ageConfirmed, onChange, onNext, onBack }: Props) {
  const canProceed = value.trim().length > 0 && ageConfirmed;

  return (
    <section aria-labelledby="step2-heading">
      <h2 id="step2-heading" className="text-2xl font-bold">
        Apa yang ingin kamu dipanggil?
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Kamu bisa memakai nama asli atau nama samaran — sepenuhnya pilihanmu.
      </p>

      <div className="mt-6">
        <label htmlFor="nickname" className="block text-sm text-slate-300 mb-2">
          Panggilan
        </label>
        <input
          id="nickname"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 32), ageConfirmed)}
          placeholder="mis. Rara, Dito, Anon..."
          maxLength={32}
          className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-right text-xs text-slate-600">{value.length}/32</p>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800 has-[:checked]:ring-blue-500">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => onChange(value, e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span className="text-sm text-slate-300">
          Aku berumur 13 tahun atau lebih dan menyetujui{' '}
          <span className="text-blue-400">Ketentuan Layanan</span>
        </span>
      </label>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Lanjut →
        </button>
      </div>
    </section>
  );
}
