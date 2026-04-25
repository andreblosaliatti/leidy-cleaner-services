import { getFirstName } from '../../features/auth/session';
import { useAuth } from '../../features/auth/useAuth';
import { DashboardCards, DashboardHeader } from './DashboardCards';

const adminItems = [
  {
    title: 'Verificações',
    description: 'Área futura para análise operacional de documentos e perfis.',
  },
  {
    title: 'Profissionais',
    description: 'Base para acompanhamento administrativo de perfis profissionais.',
  },
  {
    title: 'Solicitações',
    description: 'Espaço reservado para supervisão das solicitações de faxina.',
  },
  {
    title: 'Atendimentos',
    description: 'Área futura para visão operacional de serviços confirmados.',
  },
  {
    title: 'Pagamentos',
    description: 'Base para consulta administrativa de pagamentos recebidos.',
  },
  {
    title: 'Ocorrências',
    description: 'Espaço reservado para acompanhamento e resolução de ocorrências.',
  },
];

export function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-5">
      <DashboardHeader
        title={`Administração, ${getFirstName(user?.nomeCompleto ?? '')}.`}
        description="A fundação da área administrativa está pronta para receber as telas operacionais sem simular dados ou indicadores."
      />
      <DashboardCards items={adminItems} />
    </div>
  );
}
