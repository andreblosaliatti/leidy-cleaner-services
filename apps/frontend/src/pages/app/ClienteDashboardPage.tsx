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
    description: 'Acompanhe checkouts e status de pagamentos vinculados aos atendimentos.',
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
        description="Sua área de cliente está pronta para receber os próximos fluxos operacionais, mantendo contratação, pagamentos e histórico separados por etapa."
      />
      {cliente.pagamentosPendentes > 0 && (
        <DashboardActionAlert
          cta={cliente.primeiroAtendimentoPagamentoPendenteId ? 'Pagar agora' : 'Ver pagamento'}
          description="Finalize o checkout para liberar a próxima etapa do atendimento. A confirmação definitiva continua vindo do webhook."
          href={pendingPaymentHref}
          title="Você tem pagamento pendente"
        />
      )}
      <DashboardSummaryCards
        items={[
          {
            title: 'Pagamentos pendentes',
            value: cliente.pagamentosPendentes,
            description: 'Atendimentos aguardando checkout ou confirmação.',
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
