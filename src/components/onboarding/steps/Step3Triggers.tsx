'use client';

const TRIGGER_OPTIONS = [
  { id: 'pekerjaan',       label: '💼 Pekerjaan' },
  { id: 'kuliah/sekolah',  label: '📚 Kuliah/Sekolah' },
  { id: 'keluarga',        label: '🏠 Keluarga' },
  { id: 'hubungan',        label: '💔 Hubungan' },
  { id: 'keuangan',        label: '💸 Keuangan' },
  { id: 'kesehatan',       label: '🏥 Kesehatan' },
  { id: 'kesepian',        label: '🌧️ Kesepian' },
  { id: 'lainnya',         label: '✨ Lainnya' },
];

interface Props {
  value: string[];
  onChange: (triggers: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Triggers({ value, onChange, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  const canProceed = value.length > 0;

  return (
    <section aria-labelledby="step3-heading">
      <h2 id="step3-heading" className="text-2xl font-bold">
        Apa yang sering bikin kamu stres?
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Pilih semua yang relevan — ini membantu kami menyesuaikan konten untukmu.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TRIGGER_OPTIONS.map((opt) => {
          const selected = value.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'bg-blue-600 text-white ring-2 ring-blue-500'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {value.length === 0 && (
        <p className="mt-3 text-xs text-slate-500">Pilih minimal satu.</p>
      )}

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
