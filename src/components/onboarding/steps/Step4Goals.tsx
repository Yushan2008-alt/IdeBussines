'use client';

const GOAL_OPTIONS = [
  { id: 'mengurangi stress',    label: '😮‍💨 Mengurangi stress' },
  { id: 'tidur lebih nyenyak',  label: '😴 Tidur lebih nyenyak' },
  { id: 'mengelola emosi',      label: '🧘 Mengelola emosi' },
  { id: 'tidak merasa sendiri', label: '🤝 Tidak merasa sendiri' },
  { id: 'memahami diri',        label: '🪞 Memahami diri' },
];

interface Props {
  value: string[];
  onChange: (goals: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Goals({ value, onChange, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  const canProceed = value.length > 0;

  return (
    <section aria-labelledby="step4-heading">
      <h2 id="step4-heading" className="text-2xl font-bold">
        Apa tujuanmu di sini?
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Pilih satu atau lebih. Ini membantu kami memprioritaskan fitur yang paling berguna untukmu.
      </p>

      <div className="mt-6 space-y-2">
        {GOAL_OPTIONS.map((opt) => {
          const selected = value.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected
                  ? 'bg-blue-600/20 text-blue-200 ring-2 ring-blue-500'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 ring-1 ring-slate-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {value.length === 0 && (
        <p className="mt-3 text-xs text-slate-500">Pilih minimal satu tujuan.</p>
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
