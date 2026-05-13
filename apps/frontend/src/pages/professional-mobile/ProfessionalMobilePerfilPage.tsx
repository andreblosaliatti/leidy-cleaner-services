import { ProfessionalMobilePlaceholderPage } from './ProfessionalMobilePlaceholderPage';

export function ProfessionalMobilePerfilPage() {
  return (
    <ProfessionalMobilePlaceholderPage
      title="Perfil mobile"
      description="O app profissional precisa de uma tela de perfil mais direta para celular, mas sem duplicar logica. A edicao completa e os ajustes de regioes/verificacao entram no M4 e M5."
      stageLabel="M4 e M5 planejados"
      primaryAction={{ href: '/app/profissional/perfil', label: 'Abrir perfil completo atual' }}
      secondaryAction={{ href: '/profissional/app', label: 'Voltar para a home mobile' }}
    />
  );
}
