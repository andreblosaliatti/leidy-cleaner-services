import { StateBox } from '../../../components/ui/PageState';
import type { SolicitacaoFaxina } from '../solicitacoes/types';
import { CreditoSolicitacaoCard } from './CreditoSolicitacaoCard';
import type { CreditoSolicitacao } from './types';

type CreditosSolicitacaoListProps = {
  creditos: CreditoSolicitacao[];
  isSubmittingCreditoId?: number | null;
  onUse?: ((credito: CreditoSolicitacao) => void) | null;
  solicitacaoAlvo?: SolicitacaoFaxina | null;
};

export function CreditosSolicitacaoList({
  creditos,
  isSubmittingCreditoId = null,
  onUse = null,
  solicitacaoAlvo = null,
}: CreditosSolicitacaoListProps) {
  if (creditos.length === 0) {
    return (
      <StateBox
        tone="empty"
        title="Voce nao possui solicitacoes de reposicao disponiveis."
        description="Quando uma solicitacao paga nao for aceita pela profissional, uma reposicao equivalente aparecera aqui."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-slate-600">
        A solicitacao de reposicao pode ser usada apenas em uma nova solicitacao equivalente. A validacao final e feita pelo sistema.
      </p>
      {creditos.map((credito) => (
        <CreditoSolicitacaoCard
          key={credito.id}
          credito={credito}
          isSubmitting={isSubmittingCreditoId === credito.id}
          onUse={onUse}
          solicitacaoAlvo={solicitacaoAlvo}
        />
      ))}
    </div>
  );
}
