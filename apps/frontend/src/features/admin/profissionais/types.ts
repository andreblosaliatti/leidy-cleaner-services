export type StatusAprovacaoProfissional = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO';

export type StatusConta = 'ATIVA' | 'INATIVA' | 'BLOQUEADA' | 'PENDENTE_VERIFICACAO';

export type TipoUsuario = 'ADMIN' | 'CLIENTE' | 'PROFISSIONAL';

export type PerfilProfissionalAdmin = {
  id: number;
  usuarioId: number;
  nomeCompleto: string;
  email: string;
  telefone: string;
  nomeExibicao: string;
  cpf: string;
  dataNascimento: string;
  descricao: string | null;
  fotoPerfilUrl: string | null;
  experienciaAnos: number;
  ativoParaReceberChamados: boolean;
  statusAprovacao: StatusAprovacaoProfissional;
  notaMedia: number;
  totalAvaliacoes: number;
  criadoEm: string;
  atualizadoEm: string;
  statusConta: StatusConta;
  tipoUsuario: TipoUsuario;
};

export type PerfilProfissionalAprovacao = {
  id: number;
  usuarioId: number;
  nomeExibicao: string;
  cpf: string;
  dataNascimento: string;
  descricao: string | null;
  fotoPerfilUrl: string | null;
  experienciaAnos: number;
  ativoParaReceberChamados: boolean;
  statusAprovacao: StatusAprovacaoProfissional;
  notaMedia: number;
  totalAvaliacoes: number;
  criadoEm: string;
  atualizadoEm: string;
};

export type AnalisarProfissionalRequest = {
  statusAprovacao: StatusAprovacaoProfissional;
};

export type ListarProfissionaisAdminParams = {
  statusAprovacao?: StatusAprovacaoProfissional;
  search?: string;
};
