import { formatNotaAvaliacao } from './avaliacaoLabels';
import type { AvaliacaoProfissional } from './types';

type AvaliacaoResumoProps = {
  avaliacao: AvaliacaoProfissional;
};

export function AvaliacaoResumo({ avaliacao }: AvaliacaoResumoProps) {
  return (
    <article className="rounded-lg border border-cyan-100 bg-cyan-50 p-5 text-cyan-900 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black">Avaliação registrada</h3>
          <p className="mt-2 text-sm font-semibold">Nota {formatNotaAvaliacao(avaliacao.nota)}</p>
        </div>
      </div>

      {avaliacao.comentario && <p className="mt-4 text-sm leading-6">{avaliacao.comentario}</p>}
    </article>
  );
}
