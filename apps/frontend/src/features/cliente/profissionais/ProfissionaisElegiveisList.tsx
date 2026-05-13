import { ProfissionalElegivelCard } from './ProfissionalElegivelCard';
import type { ProfissionalDisponivel } from './types';

type ProfissionaisElegiveisListProps = {
  onReadReviews: (profissional: ProfissionalDisponivel) => void;
  onToggle: (profissional: ProfissionalDisponivel) => void;
  profissionais: ProfissionalDisponivel[];
  selectedProfessionalId: number | null;
};

export function ProfissionaisElegiveisList({
  onReadReviews,
  onToggle,
  profissionais,
  selectedProfessionalId,
}: ProfissionaisElegiveisListProps) {
  return (
    <div className="grid gap-4">
      {profissionais.map((profissional) => (
        <ProfissionalElegivelCard
          key={profissional.profissionalId}
          profissional={profissional}
          selected={selectedProfessionalId === profissional.profissionalId}
          onReadReviews={onReadReviews}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
