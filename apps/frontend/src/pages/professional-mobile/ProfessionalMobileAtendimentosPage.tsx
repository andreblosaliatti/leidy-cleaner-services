import { ProfessionalMobilePlaceholderPage } from './ProfessionalMobilePlaceholderPage';

export function ProfessionalMobileAtendimentosPage() {
  return (
    <ProfessionalMobilePlaceholderPage
      title="Atendimentos mobile"
      description="Esta tela valida o shell mobile e a hierarquia da area de atendimentos. Os detalhes completos, checkpoints e acoes de iniciar/finalizar entram no M3."
      stageLabel="M3 planejado"
      primaryAction={{ href: '/app/profissional/atendimentos', label: 'Abrir atendimentos na area web atual' }}
      secondaryAction={{ href: '/profissional/app', label: 'Voltar para a home mobile' }}
    />
  );
}
