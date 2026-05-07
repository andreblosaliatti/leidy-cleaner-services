import { getFirstName } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { useDashboardIndicators } from '../../features/dashboard/useDashboardIndicators';
import { DashboardActionAlert, DashboardCards, DashboardHeader, DashboardSummaryCards } from './DashboardCards';

const profissionalItems = [
  {
    title: 'Perfil',
    description: 'Base para dados profissionais e apresentação dentro da plataforma.',
    href: '/app/profissional/perfil',
  },
  {
    title: 'Regiões',
    description: 'Selecione os bairros/regiões onde você atende.',
    href: '/app/profissional/regioes',
  },
  {
    title: 'Disponibilidade',
    description: 'Gerencie sua agenda semanal e horários disponíveis.',
    href: '/app/profissional/disponibilidade',
  },
  {
    title: 'Verificações',
    description: 'Acompanhe seu status documental e envie dados de verificação.',
    href: '/app/profissional/verificacoes',
  },
  {
    title: 'Convites',
    description: 'Visualize solicitações recebidas e responda aos convites pendentes.',
    href: '/app/profissional/convites',
  },
  {
    title: 'Atendimentos',
    description: 'Acompanhe serviços atribuídos e registre início ou fim quando permitido.',
    href: '/app/profissional/atendimentos',
  },
  {
    title: 'Ocorrências',
    description: 'Registre e acompanhe ocorrências vinculadas aos seus atendimentos.',
    href: '/app/ocorrencias',
  },
];

export function ProfissionalDashboardPage() {
  const { token, user } = useAuth();
  const { profissional } = useDashboardIndicators('PROFISSIONAL', token);

  return (
    <div className="grid gap-5">
      <DashboardHeader
        title={`Olá, ${getFirstName(user?.nomeCompleto) || 'Profissional'}.`}
        description="Sua área profissional reúne perfil, regiões, disponibilidade, convites e atendimentos operacionais."
      />
      {profissional.convitesPendentes > 0 && (
        <DashboardActionAlert
          cta="Ver convites"
          description="Responda dentro do prazo para manter o fluxo de aceite e atendimento em dia."
          href="/app/profissional/convites"
          title="Você tem convite pendente"
        />
      )}
      <DashboardSummaryCards
        items={[
          {
            title: 'Convites pendentes',
            value: profissional.convitesPendentes,
            description: 'Convites aguardando resposta.',
            tone: profissional.convitesPendentes > 0 ? 'red' : 'neutral',
          },
          {
            title: 'Próximos atendimentos',
            value: profissional.proximosAtendimentos,
            description: 'Serviços confirmados para executar.',
            tone: profissional.proximosAtendimentos > 0 ? 'green' : 'neutral',
          },
          {
            title: 'Em execução',
            value: profissional.atendimentosEmExecucao,
            description: 'Atendimentos já iniciados.',
            tone: profissional.atendimentosEmExecucao > 0 ? 'yellow' : 'neutral',
          },
        ]}
      />
      <DashboardCards items={profissionalItems} />
    </div>
  );
}
