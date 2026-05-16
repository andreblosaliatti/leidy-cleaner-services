import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FormAlert } from '../../components/ui/FormAlert';
import { StateBox } from '../../components/ui/PageState';
import { useAuth } from '../../features/auth/useAuth';
import { buscarMinhaVerificacao } from '../../features/profissional/perfil/profissionalApi';
import type { DocumentoVerificacao, StatusVerificacao } from '../../features/profissional/perfil/types';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

const queryKeys = {
  verificacao: ['profissional', 'verificacao'],
};

export function ProfessionalMobileVerificacaoPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const verificacaoQuery = useQuery({
    queryKey: queryKeys.verificacao,
    queryFn: () => buscarMinhaVerificacao(requireToken(token)),
    enabled: Boolean(token),
    retry: (failureCount, error) => (isVerificationNotFound(error) ? false : failureCount < 2),
  });

  const protectedError = useMemo(
    () =>
      verificacaoQuery.error instanceof ApiError && verificacaoQuery.error.status === 401 ? verificacaoQuery.error : null,
    [verificacaoQuery.error],
  );

  useEffect(() => {
    if (protectedError) {
      logout();
      navigate('/entrar', { replace: true });
    }
  }, [logout, navigate, protectedError]);

  const verificacaoNotFound = isVerificationNotFound(verificacaoQuery.error);

  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Verificacao</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">Status documental</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Acompanhe o andamento da sua verificacao sem depender da area desktop. O envio de documentos pelo celular entra no proximo slice.
        </p>
      </section>

      {verificacaoQuery.isLoading && (
        <StateBox
          tone="loading"
          title="Carregando verificacao"
          description="Buscando o status documental da sua conta."
          className="rounded-[1.75rem]"
        />
      )}

      {verificacaoQuery.isError && !verificacaoNotFound && !protectedError && (
        <FormAlert
          tone="error"
          title="Nao foi possivel carregar a verificacao"
          message={getApiErrorMessage(verificacaoQuery.error)}
          details={verificacaoQuery.error instanceof ApiError ? verificacaoQuery.error.errors : []}
        />
      )}

      {verificacaoNotFound && (
        <StateBox
          tone="empty"
          title="Nenhuma verificacao registrada"
          description="Ainda nao encontramos dados documentais enviados nesta conta. O envio pelo mobile sera liberado no proximo slice."
          className="rounded-[1.75rem]"
        />
      )}

      {verificacaoQuery.data && (
        <>
          <VerificationStatusCard verificacao={verificacaoQuery.data} />
          <VerificationSummaryCard verificacao={verificacaoQuery.data} />
          <VerificationAttachmentsCard verificacao={verificacaoQuery.data} />
        </>
      )}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">Proximo passo</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Nesta etapa voce pode apenas consultar o status e as observacoes da analise. O envio ou reenvio de arquivos pelo app entra no proximo slice do M5.
        </p>
      </section>

      <div className="grid gap-3">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to="/app/profissional/verificacoes"
        >
          Abrir verificacao completa atual
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          to="/profissional/app/perfil"
        >
          Voltar para o perfil mobile
        </Link>
      </div>
    </div>
  );
}

function VerificationStatusCard({ verificacao }: { verificacao: DocumentoVerificacao }) {
  const statusInfo = getStatusInfo(verificacao.statusVerificacao);

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Situacao atual</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">{statusInfo.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{statusInfo.description}</p>
        </div>
        <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      {verificacao.observacaoAnalise && (
        <div
          className={[
            'mt-5 rounded-[1.25rem] border px-4 py-3 text-sm leading-6',
            verificacao.statusVerificacao === 'REJEITADO'
              ? 'border-red-100 bg-red-50 text-red-900'
              : 'border-amber-100 bg-amber-50 text-amber-900',
          ].join(' ')}
        >
          <p className="font-black">{verificacao.statusVerificacao === 'REJEITADO' ? 'Motivo da rejeicao' : 'Observacao da analise'}</p>
          <p className="mt-2">{verificacao.observacaoAnalise}</p>
        </div>
      )}
    </section>
  );
}

function VerificationSummaryCard({ verificacao }: { verificacao: DocumentoVerificacao }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-900">Resumo enviado</h3>
      <div className="mt-4 grid gap-4">
        <DetailItem label="Tipo de documento" value={formatDocumentType(verificacao.tipoDocumento)} />
        <DetailItem label="Numero informado" value={maskDocumentNumber(verificacao.numeroDocumento)} />
        <DetailItem label="Registrado em" value={formatDateTime(verificacao.criadoEm)} />
        <DetailItem label="Analisado em" value={verificacao.analisadoEm ? formatDateTime(verificacao.analisadoEm) : 'Aguardando analise'} muted={!verificacao.analisadoEm} />
      </div>
    </section>
  );
}

function VerificationAttachmentsCard({ verificacao }: { verificacao: DocumentoVerificacao }) {
  const items = [
    { label: 'Documento frente', available: Boolean(verificacao.documentoFrenteUrl) },
    { label: 'Documento verso', available: Boolean(verificacao.documentoVersoUrl) },
    { label: 'Selfie', available: Boolean(verificacao.selfieUrl) },
    { label: 'Comprovante de residencia', available: Boolean(verificacao.comprovanteResidenciaUrl) },
  ];

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-900">Arquivos registrados</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        O app mostra apenas um resumo seguro dos arquivos associados, sem expor links internos.
      </p>

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">{item.label}</span>
            <span
              className={[
                'inline-flex rounded-2xl px-3 py-1 text-xs font-black uppercase tracking-[0.12em]',
                item.available ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-200 text-slate-600',
              ].join(' ')}
            >
              {item.available ? 'Enviado' : 'Nao informado'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailItem({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={['mt-1 text-sm font-semibold leading-6', muted ? 'text-slate-500' : 'text-slate-800'].join(' ')}>{value}</p>
    </div>
  );
}

function getStatusInfo(status: StatusVerificacao) {
  const map: Record<StatusVerificacao, { label: string; title: string; description: string; className: string }> = {
    PENDENTE: {
      label: 'Pendente',
      title: 'Aguardando envio completo',
      description: 'Seu cadastro documental ainda nao entrou em analise. Assim que os arquivos forem enviados, o status sera atualizado pelo backend.',
      className: 'bg-amber-50 text-amber-800',
    },
    EM_ANALISE: {
      label: 'Em analise',
      title: 'Analise em andamento',
      description: 'Seus documentos foram recebidos e estao sendo avaliados pela equipe responsavel.',
      className: 'bg-blue-50 text-blue-800',
    },
    APROVADO: {
      label: 'Aprovado',
      title: 'Verificacao aprovada',
      description: 'Sua verificacao documental foi aprovada. Continue acompanhando convites e atendimentos pelo app.',
      className: 'bg-cyan-50 text-cyan-700',
    },
    REJEITADO: {
      label: 'Rejeitado',
      title: 'Verificacao rejeitada',
      description: 'Encontramos um problema na analise documental. Confira a observacao abaixo para entender o que precisa ser ajustado.',
      className: 'bg-red-50 text-red-700',
    },
  };

  return map[status];
}

function formatDocumentType(tipoDocumento: string) {
  return tipoDocumento
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function maskDocumentNumber(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 4) {
    return value;
  }

  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function isVerificationNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404 && error.code === 'VERIFICACAO_NOT_FOUND';
}

function requireToken(token: string | null) {
  if (!token) {
    throw new ApiError({
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Sessao expirada. Entre novamente.',
    });
  }

  return token;
}
