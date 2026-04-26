import { SolicitacaoCard } from './SolicitacaoCard';
import type { SolicitacaoContexto, SolicitacaoFaxina } from './types';

type SolicitacaoListProps = {
  cancellingId?: number | null;
  getContexto: (solicitacao: SolicitacaoFaxina) => SolicitacaoContexto;
  onCancel: (solicitacao: SolicitacaoFaxina) => void;
  onSelect: (solicitacao: SolicitacaoFaxina) => void;
  selectedId?: number | null;
  solicitacoes: SolicitacaoFaxina[];
};

export function SolicitacaoList({
  cancellingId,
  getContexto,
  onCancel,
  onSelect,
  selectedId,
  solicitacoes,
}: SolicitacaoListProps) {
  return (
    <div className="grid gap-4">
      {solicitacoes.map((solicitacao) => (
        <SolicitacaoCard
          key={solicitacao.id}
          contexto={getContexto(solicitacao)}
          isCancelling={cancellingId === solicitacao.id}
          selected={selectedId === solicitacao.id}
          solicitacao={solicitacao}
          onCancel={onCancel}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
