import type { Endereco } from './types';

type EnderecoCardProps = {
  endereco: Endereco;
  isDeleting?: boolean;
  onDelete: (endereco: Endereco) => void;
  onEdit: (endereco: Endereco) => void;
};

export function EnderecoCard({ endereco, isDeleting = false, onDelete, onEdit }: EnderecoCardProps) {
  return (
    <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">
              {endereco.logradouro}, {endereco.numero}
            </h2>
            {endereco.principal && (
              <span className="rounded-lg bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-green-700">
                Principal
              </span>
            )}
          </div>
          {endereco.complemento && <p className="mt-1 text-sm font-semibold text-slate-600">{endereco.complemento}</p>}
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {endereco.bairro} · {endereco.cidade} - {endereco.estado}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">CEP {endereco.cep}</p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            type="button"
            onClick={() => onEdit(endereco)}
          >
            Editar
          </button>
          <button
            className="min-h-10 rounded-lg border border-red-100 px-4 text-sm font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:text-slate-400"
            disabled={isDeleting}
            type="button"
            onClick={() => onDelete(endereco)}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </article>
  );
}
