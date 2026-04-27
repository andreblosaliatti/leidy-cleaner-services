import type { ProfissionalDisponivel } from './types';

type SelecaoProfissionaisPanelProps = {
  isSubmitting?: boolean;
  onRemove: (profissionalId: number) => void;
  onSubmit: () => void;
  profissionais: ProfissionalDisponivel[];
  validationMessage?: string | null;
};

export function SelecaoProfissionaisPanel({
  isSubmitting = false,
  onRemove,
  onSubmit,
  profissionais,
  validationMessage,
}: SelecaoProfissionaisPanelProps) {
  return (
    <aside className="self-start rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Seleção</p>
      <h2 className="mt-2 text-xl font-black text-slate-900">Profissionais escolhidas</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Selecione de 1 a 3 profissionais. A ordem enviada segue a ordem abaixo.</p>

      {validationMessage && (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {validationMessage}
        </p>
      )}

      {profissionais.length === 0 ? (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Nenhuma profissional selecionada ainda.
        </div>
      ) : (
        <ol className="mt-4 grid gap-3">
          {profissionais.map((profissional, index) => (
            <li key={profissional.profissionalId} className="rounded-lg border border-green-100 bg-green-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-green-700">{index + 1}ª escolha</p>
                  <p className="mt-1 font-black text-slate-900">{profissional.nomeExibicao}</p>
                </div>
                <button
                  className="rounded-lg px-3 py-2 text-sm font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  type="button"
                  onClick={() => onRemove(profissional.profissionalId)}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <button
        className="mt-5 min-h-11 w-full rounded-lg bg-green-700 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(21,128,61,0.18)] transition hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        disabled={isSubmitting}
        type="button"
        onClick={onSubmit}
      >
        {isSubmitting ? 'Enviando seleção...' : 'Enviar seleção'}
      </button>
    </aside>
  );
}
