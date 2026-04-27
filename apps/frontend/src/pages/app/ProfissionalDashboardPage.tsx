import { getFirstName } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { DashboardCards, DashboardHeader } from './DashboardCards';

const profissionalItems = [
  {
    title: 'Perfil',
    description: 'Base para dados profissionais e apresentação dentro da plataforma.',
    href: '/app/profissional/perfil',
  },
  {
    title: 'Regiões',
    description: 'Área futura para regiões de atendimento habilitadas.',
  },
  {
    title: 'Disponibilidade',
    description: 'Espaço reservado para agenda semanal e horários disponíveis.',
  },
  {
    title: 'Verificações',
    description: 'Acompanhamento futuro de documentos, selfie e aprovação operacional.',
  },
  {
    title: 'Convites',
    description: 'Visualize solicitações recebidas e responda aos convites pendentes.',
    href: '/app/profissional/convites',
  },
  {
    title: 'Atendimentos',
    description: 'Resumo futuro dos serviços confirmados, em execução e concluídos.',
  },
];

export function ProfissionalDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-5">
      <DashboardHeader
        title={`Olá, ${getFirstName(user?.nomeCompleto ?? '')}.`}
        description="Sua área profissional reúne perfil, regiões, disponibilidade, verificações e convites operacionais."
      />
      <DashboardCards items={profissionalItems} />
    </div>
  );
}
