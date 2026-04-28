import { AprovacaoProfissionalForm } from './AprovacaoProfissionalForm';
import {
  formatAdminDate,
  formatAdminDateTime,
  formatRating,
  getStatusContaLabel,
  getTipoUsuarioLabel,
} from './profissionalLabels';
import { ProfissionalStatusBadge } from './ProfissionalStatusBadge';
import type { PerfilProfissionalAdmin, StatusAprovacaoProfissional } from './types';

type ProfissionalAdminCardProps = {
  isSubmitting: boolean;
  profissional: PerfilProfissionalAdmin;
  onSubmitAprovacao: (values: { profissionalId: number; statusAprovacao: StatusAprovacaoProfissional }) => void;
};

export function ProfissionalAdminCard({ isSubmitting, profissional, onSubmitAprovacao }: ProfissionalAdminCardProps) {
  return (
    <article className="grid gap-5 rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">{profissional.nomeExibicao}</h2>
            <ProfissionalStatusBadge status={profissional.statusAprovacao} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700">{profissional.nomeCompleto}</p>
          <p className="mt-1 break-words text-sm leading-6 text-slate-600">{profissional.email}</p>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Profissional" value={`#${profissional.id}`} />
            <DetailItem label="Usuário" value={`#${profissional.usuarioId}`} />
            <DetailItem label="Telefone" value={profissional.telefone} />
            <DetailItem label="CPF" value={profissional.cpf} />
            <DetailItem label="Nascimento" value={formatAdminDate(profissional.dataNascimento)} />
            <DetailItem label="Experiência" value={`${profissional.experienciaAnos} ano(s)`} />
            <DetailItem label="Recebe chamados" value={profissional.ativoParaReceberChamados ? 'Sim' : 'Não'} />
            <DetailItem label="Conta" value={getStatusContaLabel(profissional.statusConta)} />
            <DetailItem label="Tipo" value={getTipoUsuarioLabel(profissional.tipoUsuario)} />
            <DetailItem label="Nota média" value={formatRating(profissional.notaMedia)} />
            <DetailItem label="Avaliações" value={String(profissional.totalAvaliacoes)} />
            <DetailItem label="Atualizado em" value={formatAdminDateTime(profissional.atualizadoEm)} />
          </dl>
        </div>
      </div>

      <AprovacaoProfissionalForm
        profissionalId={profissional.id}
        initialStatus={profissional.statusAprovacao}
        isSubmitting={isSubmitting}
        onSubmit={onSubmitAprovacao}
      />
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold leading-6 text-slate-800">{value}</dd>
    </div>
  );
}
