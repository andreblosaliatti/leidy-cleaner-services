import { getFirstName } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { DashboardCards, DashboardHeader } from './DashboardCards';

const profissionalItems = [
  {
    title: 'Perfil',
    description: 'Base para dados profissionais e apresentação dentro da plataforma.',
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
    description: 'Área futura para convites de solicitações de faxina.',
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
        description="Sua área profissional está preparada para receber perfil, regiões, disponibilidade, verificações, convites e atendimentos nos próximos marcos."
      />
      <DashboardCards items={profissionalItems} />
    </div>
  );
}
