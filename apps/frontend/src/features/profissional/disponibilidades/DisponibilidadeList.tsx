import { formatDisponibilidadeLabel, sortDisponibilidades } from './disponibilidadeDisplay';
import type { DisponibilidadeProfissional } from '../perfil/types';

type DisponibilidadeListProps = {
  disponibilidades: DisponibilidadeProfissional[];
  deletingId?: number | null;
  onDelete: (disponibilidade: DisponibilidadeProfissional) => void;
  onEdit: (disponibilidade: DisponibilidadeProfissional) => void;
};

export function DisponibilidadeList({ disponibilidades, deletingId, onDelete, onEdit }: DisponibilidadeListProps) {
  const orderedDisponibilidades = sortDisponibilidades(disponibilidades);

  return (
    <div className="grid gap-3">
      {orderedDisponibilidades.map((disponibilidade) => (
        <article key={disponibilidade.id} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-slate-900">{formatDisponibilidadeLabel(disponibilidade)}</h3>
                <span
                  className={[
                    'rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-[0.1em]',
                    disponibilidade.ativo ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {disponibilidade.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
                type="button"
                onClick={() => onEdit(disponibilidade)}
              >
                Editar
              </button>
              <button
                className="min-h-10 rounded-lg border border-red-100 px-4 text-sm font-black text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={deletingId === disponibilidade.id}
                type="button"
                onClick={() => onDelete(disponibilidade)}
              >
                {deletingId === disponibilidade.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
