import type { QueryClient } from '@tanstack/react-query';

import { canFinishAtendimento, canStartAtendimento } from '../../features/atendimentos/atendimentoLabels';
import type { AtendimentoVisivel } from '../../features/atendimentos/types';
import type { ConviteResposta } from '../../features/profissional/convites/types';
import { ApiError, getApiErrorMessage } from '../../services/apiClient';

export const professionalMobileQueryKeys = {
  convites: ['profissional', 'convites'] as const,
  conviteDetalhe: (id: number) => ['profissional', 'convites', 'mobile', id] as const,
  atendimentos: ['atendimentos', 'meus', 'profissional'] as const,
  atendimentoDetalhe: (id: number) => ['atendimentos', 'profissional', id] as const,
  atendimentoCheckpoints: (id: number) => ['atendimentos', 'profissional', id, 'checkpoints'] as const,
};

export type MobileFeedback = {
  tone: 'error' | 'success' | 'info';
  title: string;
  message: string;
  details?: string[];
};

export type ConviteAction = 'aceitar' | 'recusar';
export type AttendanceAction = 'iniciar' | 'finalizar';

const START_ADVANCE_WINDOW_IN_MS = 30 * 60 * 1000;

export function requireProfessionalMobileToken(token: string | null) {
  if (!token) {
    throw new ApiError({
      status: 401,
      code: 'UNAUTHENTICATED',
      message: 'Sessao expirada. Entre novamente.',
    });
  }

  return token;
}

export async function refreshProfessionalMobileConviteQueries(queryClient: QueryClient, conviteId?: number) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: professionalMobileQueryKeys.convites }),
    queryClient.invalidateQueries({ queryKey: professionalMobileQueryKeys.atendimentos }),
    queryClient.invalidateQueries({ queryKey: ['atendimentos', 'profissional'] }),
    conviteId
      ? queryClient.invalidateQueries({ queryKey: professionalMobileQueryKeys.conviteDetalhe(conviteId) })
      : Promise.resolve(),
  ]);
}

export async function refreshProfessionalMobileAttendanceQueries(queryClient: QueryClient, atendimentoId: number) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: professionalMobileQueryKeys.atendimentos }),
    queryClient.invalidateQueries({ queryKey: professionalMobileQueryKeys.atendimentoDetalhe(atendimentoId) }),
    queryClient.invalidateQueries({ queryKey: professionalMobileQueryKeys.atendimentoCheckpoints(atendimentoId) }),
  ]);
}

export function buildConviteSuccessMessage(action: ConviteAction, response: ConviteResposta) {
  if (action === 'aceitar') {
    return response.atendimentoId
      ? `Convite aceito com sucesso. Atendimento #${response.atendimentoId} confirmado.`
      : 'Convite aceito com sucesso.';
  }

  return 'Convite recusado com sucesso.';
}

export function buildConviteErrorTitle(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Voce nao pode responder a este convite';
    }

    if (error.code === 'CONVITE_EXPIRADO') {
      return 'Convite expirado';
    }

    if (error.code === 'CONVITE_STATUS_INCOMPATIVEL' || error.code === 'ATENDIMENTO_JA_CRIADO' || error.status === 409) {
      return 'Convite indisponivel';
    }

    if (error.code === 'CONVITE_NOT_FOUND' || error.status === 404) {
      return 'Convite nao encontrado';
    }
  }

  return 'Nao foi possivel responder ao convite';
}

export function buildConviteErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Voce nao tem permissao para responder a este convite.';
    }

    if (error.code === 'CONVITE_EXPIRADO') {
      return 'Este convite expirou e nao pode mais ser respondido.';
    }

    if (error.code === 'CONVITE_STATUS_INCOMPATIVEL' || error.code === 'ATENDIMENTO_JA_CRIADO') {
      return 'Este convite nao esta mais disponivel para resposta.';
    }

    if (error.status === 409) {
      return 'Este convite nao esta mais disponivel para resposta.';
    }

    if (error.code === 'CONVITE_NOT_FOUND' || error.status === 404) {
      return 'Este convite nao esta disponivel para sua conta.';
    }
  }

  return getApiErrorMessage(error);
}

export function shouldRefreshConviteAfterActionError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.code === 'CONVITE_EXPIRADO' ||
    error.code === 'CONVITE_STATUS_INCOMPATIVEL' ||
    error.code === 'ATENDIMENTO_JA_CRIADO' ||
    error.code === 'CONVITE_NOT_FOUND' ||
    error.status === 404 ||
    error.status === 409
  );
}

export function buildAttendanceSuccessFeedback(action: AttendanceAction): MobileFeedback {
  return action === 'iniciar'
    ? {
        tone: 'success',
        title: 'Servico iniciado',
        message: 'Inicio do servico registrado com sucesso.',
      }
    : {
        tone: 'success',
        title: 'Servico finalizado',
        message: 'Finalizacao do servico registrada com sucesso.',
      };
}

export function buildAttendanceErrorTitle(error: unknown, action: AttendanceAction) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Voce nao pode atualizar este atendimento';
    }

    if (error.code === 'ATENDIMENTO_JA_INICIADO') {
      return 'Servico ja iniciado';
    }

    if (error.code === 'ATENDIMENTO_JA_FINALIZADO') {
      return 'Servico ja finalizado';
    }

    if (error.code === 'ATENDIMENTO_NAO_INICIADO') {
      return 'Servico ainda nao iniciado';
    }

    if (error.code === 'ATENDIMENTO_STATUS_INCOMPATIVEL' || error.status === 409) {
      return action === 'iniciar' ? 'Nao foi possivel iniciar agora' : 'Nao foi possivel finalizar agora';
    }

    if (error.code === 'ATENDIMENTO_NOT_FOUND' || error.status === 404) {
      return 'Atendimento nao encontrado';
    }
  }

  return action === 'iniciar' ? 'Nao foi possivel iniciar o servico' : 'Nao foi possivel finalizar o servico';
}

export function buildAttendanceErrorMessage(error: unknown, action: AttendanceAction) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Voce nao tem permissao para atualizar este atendimento.';
    }

    if (error.code === 'ATENDIMENTO_JA_INICIADO') {
      return 'Este atendimento ja foi iniciado anteriormente.';
    }

    if (error.code === 'ATENDIMENTO_JA_FINALIZADO') {
      return 'Este atendimento ja foi finalizado anteriormente.';
    }

    if (error.code === 'ATENDIMENTO_NAO_INICIADO') {
      return 'Nao e possivel finalizar antes de registrar o inicio do servico.';
    }

    if (error.code === 'ATENDIMENTO_STATUS_INCOMPATIVEL') {
      return action === 'iniciar'
        ? 'Este atendimento nao esta disponivel para iniciar neste momento.'
        : 'Este atendimento nao esta disponivel para finalizar neste momento.';
    }

    if (error.status === 409) {
      return action === 'iniciar'
        ? 'Este atendimento nao esta disponivel para iniciar neste momento.'
        : 'Este atendimento nao esta disponivel para finalizar neste momento.';
    }

    if (error.code === 'ATENDIMENTO_NOT_FOUND' || error.status === 404) {
      return 'Este atendimento nao esta disponivel para sua conta.';
    }
  }

  return getApiErrorMessage(error);
}

export function shouldRefreshAttendanceAfterActionError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.code === 'ATENDIMENTO_JA_INICIADO' ||
    error.code === 'ATENDIMENTO_JA_FINALIZADO' ||
    error.code === 'ATENDIMENTO_NAO_INICIADO' ||
    error.code === 'ATENDIMENTO_STATUS_INCOMPATIVEL' ||
    error.code === 'ATENDIMENTO_NOT_FOUND' ||
    error.status === 404 ||
    error.status === 409
  );
}

export function getQuickAttendanceAction(atendimento: AtendimentoVisivel): AttendanceAction | null {
  if (canStartAtendimento(atendimento.status)) {
    return 'iniciar';
  }

  if (canFinishAtendimento(atendimento.status)) {
    return 'finalizar';
  }

  return null;
}

export function isQuickStartBlockedBySchedule(atendimento: AtendimentoVisivel) {
  if (!canStartAtendimento(atendimento.status)) {
    return false;
  }

  const startTime = new Date(atendimento.inicioPrevistoEm).getTime();

  if (!Number.isFinite(startTime)) {
    return false;
  }

  return startTime - Date.now() > START_ADVANCE_WINDOW_IN_MS;
}

export function getQuickStartBlockedMessage() {
  return 'Voce podera iniciar este atendimento 30 minutos antes do horario marcado.';
}
