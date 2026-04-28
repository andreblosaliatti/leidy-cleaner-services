import { formatAvaliacaoDateTime, formatNotaAvaliacao } from './avaliacaoLabels';
import type { AvaliacaoProfissional } from './types';

type AvaliacaoResumoProps = {
  avaliacao: AvaliacaoProfissional;
};

export function AvaliacaoResumo({ avaliacao }: AvaliacaoResumoProps) {
  return (
    <article className="rounded-lg border border-green-100 bg-green-50 p-5 text-green-900 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black">Avaliação registrada</h3>
          <p className="mt-2 text-sm font-semibold">Nota {formatNotaAvaliacao(avaliacao.nota)}</p>
        </div>
        <p className="text-sm font-semibold">{formatAvaliacaoDateTime(avaliacao.criadoEm)}</p>
      </div>

      {avaliacao.comentario && <p className="mt-4 text-sm leading-6">{avaliacao.comentario}</p>}
    </article>
  );
}
