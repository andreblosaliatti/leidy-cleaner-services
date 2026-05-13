import type { ProfissionalDisponivel } from './types';

type SelecaoProfissionaisPanelProps = {
  isSubmitting?: boolean;
  onClear: () => void;
  onSubmit: () => void;
  profissional: ProfissionalDisponivel | null;
  validationMessage?: string | null;
};

export function SelecaoProfissionaisPanel({
  isSubmitting = false,
  onClear,
  onSubmit,
  profissional,
  validationMessage,
}: SelecaoProfissionaisPanelProps) {
  return (
    <aside className="self-start rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Escolha</p>
      <h2 className="mt-2 text-xl font-black text-slate-900">Profissional escolhida</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Depois da escolha, voce seguira para o pagamento. O convite sera enviado apenas apos a confirmacao do pagamento.
      </p>

      <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Se a profissional nao aceitar, voce tera uma solicitacao de reposicao equivalente.
      </div>

      {validationMessage && (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {validationMessage}
        </p>
      )}

      {!profissional ? (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Nenhuma profissional escolhida ainda.
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">Profissional</p>
              <p className="mt-1 font-black text-slate-900">{profissional.nomeExibicao}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {profissional.experienciaAnos} ano{profissional.experienciaAnos === 1 ? '' : 's'} de experiencia
              </p>
            </div>
            <button
              className="rounded-lg px-3 py-2 text-sm font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              type="button"
              onClick={onClear}
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      <button
        className="mt-5 min-h-11 w-full rounded-lg bg-cyan-700 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(14,138,141,0.18)] transition hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        disabled={isSubmitting || !profissional}
        type="button"
        onClick={onSubmit}
      >
        {isSubmitting ? 'Salvando escolha...' : 'Escolher profissional e ir para pagamento'}
      </button>
    </aside>
  );
}
