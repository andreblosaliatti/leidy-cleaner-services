import { getFirstName } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { useDashboardIndicators } from '../../features/dashboard/useDashboardIndicators';
import { DashboardActionAlert, DashboardCards, DashboardHeader, DashboardSummaryCards } from './DashboardCards';

const clienteItems = [
  {
    title: 'Endereços',
    description: 'Base para organizar locais de atendimento do cliente.',
    href: '/app/cliente/enderecos',
  },
  {
    title: 'Solicitações',
    description: 'Crie e acompanhe pedidos de faxina com região derivada do endereço.',
    href: '/app/cliente/solicitacoes',
  },
  {
    title: 'Pagamentos',
    description: 'Acompanhe pagamentos das solicitações e os convites liberados após a confirmação.',
    href: '/app/cliente/pagamentos',
  },
  {
    title: 'Histórico',
    description: 'Acompanhe atendimentos, checkpoints e andamento operacional.',
    href: '/app/cliente/atendimentos',
  },
  {
    title: 'Ocorrências',
    description: 'Abra e acompanhe ocorrências vinculadas aos seus atendimentos.',
    href: '/app/ocorrencias',
  },
];

export function ClienteDashboardPage() {
  const { token, user } = useAuth();
  const { cliente } = useDashboardIndicators('CLIENTE', token);
  const pendingPaymentHref = cliente.primeiroAtendimentoPagamentoPendenteId
    ? `/app/cliente/pagamentos/atendimento/${cliente.primeiroAtendimentoPagamentoPendenteId}`
    : '/app/cliente/pagamentos';

  return (
    <div className="grid gap-5">
      <DashboardHeader
        title={`Bem-vindo, ${getFirstName(user?.nomeCompleto) || 'Cliente'}.`}
        description="Acompanhe suas solicitações, confirme pagamentos com segurança e veja quando o convite é enviado para a profissional escolhida."
      />
      {cliente.pagamentosPendentes > 0 && (
        <DashboardActionAlert
          cta={cliente.primeiroAtendimentoPagamentoPendenteId ? 'Pagar agora' : 'Ver pagamento'}
          description="Finalize o checkout para liberar o envio do convite. A confirmação definitiva continua vindo do sistema."
          href={pendingPaymentHref}
          title="Você tem pagamento pendente"
        />
      )}
      <DashboardSummaryCards
        items={[
          {
            title: 'Pagamentos pendentes',
            value: cliente.pagamentosPendentes,
            description: 'Solicitações aguardando checkout ou confirmação do pagamento.',
            tone: cliente.pagamentosPendentes > 0 ? 'red' : 'neutral',
          },
          {
            title: 'Atendimentos confirmados',
            value: cliente.atendimentosConfirmados,
            description: 'Serviços liberados para execução.',
            tone: cliente.atendimentosConfirmados > 0 ? 'green' : 'neutral',
          },
          {
            title: 'Solicitações ativas',
            value: cliente.solicitacoesAtivas,
            description: 'Pedidos ainda em andamento operacional.',
            tone: cliente.solicitacoesAtivas > 0 ? 'yellow' : 'neutral',
          },
          {
            title: 'Ocorrências abertas',
            value: cliente.ocorrenciasAbertas,
            description: 'Registros abertos ou em análise.',
            tone: cliente.ocorrenciasAbertas > 0 ? 'yellow' : 'neutral',
          },
        ]}
      />
      <DashboardCards items={clienteItems} />
    </div>
  );
}
