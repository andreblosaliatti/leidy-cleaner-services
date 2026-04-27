import type { SolicitacaoFaxina } from '../solicitacoes/types';

export type ProfissionalDisponivel = {
  profissionalId: number;
  nomeExibicao: string;
  fotoPerfilUrl: string | null;
  experienciaAnos: number;
  notaMedia: number;
  totalAvaliacoes: number;
};

export type SelecionarProfissionaisRequest = {
  profissionalIds: number[];
};

export type ProfissionalSelecionado = {
  id: number;
  profissionalId: number;
  ordemEscolha: number;
  criadoEm: string;
};

export type SelecaoProfissionais = {
  solicitacaoId: number;
  selecionados: ProfissionalSelecionado[];
};

export type SolicitacaoComSelecao = {
  solicitacao: SolicitacaoFaxina;
  profissionais: ProfissionalDisponivel[];
};
