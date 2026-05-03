export type StatusVerificacao = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO';

export type DocumentoVerificacaoAdmin = {
  id: number;
  usuarioId: number;
  usuarioNome?: string | null;
  tipoDocumento: string;
  numeroDocumento: string;
  documentoFrenteUrl: string | null;
  documentoVersoUrl: string | null;
  selfieUrl: string | null;
  comprovanteResidenciaUrl: string | null;
  statusVerificacao: StatusVerificacao;
  observacaoAnalise: string | null;
  analisadoPorUsuarioId: number | null;
  analisadoPorNome?: string | null;
  analisadoEm: string | null;
  criadoEm: string;
};

export type AnalisarDocumentoVerificacaoRequest = {
  statusVerificacao: StatusVerificacao;
  observacaoAnalise?: string | null;
};
