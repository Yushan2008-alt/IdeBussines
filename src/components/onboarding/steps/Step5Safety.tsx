'use client';

interface Props {
  value: boolean;
  onChange: (has: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export function Step5Safety({ value, onChange, onSubmit, onBack, submitting }: Props) {
  return (
    <section aria-labelledby="step5-heading">
      <h2 id="step5-heading" className="text-2xl font-bold">
        Satu pertanyaan terakhir
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Jawabanmu membantu kami menyiapkan ruang yang lebih aman untukmu. Tidak ada jawaban salah.
      </p>

      <fieldset className="mt-6 space-y-3">
        <legend className="text-sm text-slate-300">
          Pernahkah kamu memiliki pikiran untuk menyakiti diri atau mengakhiri hidup?
        </legend>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800 has-[:checked]:ring-blue-500">
          <input
            type="radio"
            name="crisis_history"
            checked={value === true}
            onChange={() => onChange(true)}
            className="h-4 w-4"
          />
          <span>Pernah</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800 has-[:checked]:ring-blue-500">
          <input
            type="radio"
            name="crisis_history"
            checked={value === false}
            onChange={() => onChange(false)}
            className="h-4 w-4"
          />
          <span>Tidak pernah</span>
        </label>
      </fieldset>

      {value && (
        <div className="mt-4 rounded-xl bg-blue-600/10 p-4 ring-1 ring-blue-600/30">
          <p className="text-sm text-blue-200">
            Terima kasih sudah berbagi. Setelah ini, kami akan tunjukkan halaman bantuan dengan
            kontak yang bisa kamu hubungi kapan saja.
          </p>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          Kembali
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Selesai'}
        </button>
      </div>
    </section>
  );
}
