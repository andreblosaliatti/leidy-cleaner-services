export type StatusAprovacaoProfissional = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO';

export type PerfilProfissionalAdmin = {
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
