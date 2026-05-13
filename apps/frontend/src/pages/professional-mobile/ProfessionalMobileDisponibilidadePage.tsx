import { ProfessionalMobilePlaceholderPage } from './ProfessionalMobilePlaceholderPage';

export function ProfessionalMobileDisponibilidadePage() {
  return (
    <ProfessionalMobilePlaceholderPage
      title="Disponibilidade mobile"
      description="Esta area ja tem rota e navegacao dedicadas para o celular. O CRUD de disponibilidades adaptado para toques grandes e fluxos curtos entra no M4."
      stageLabel="M4 planejado"
      primaryAction={{ href: '/app/profissional/disponibilidade', label: 'Abrir disponibilidade completa atual' }}
      secondaryAction={{ href: '/profissional/app', label: 'Voltar para a home mobile' }}
    />
  );
}
