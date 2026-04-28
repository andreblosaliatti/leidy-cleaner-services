export type AvaliacaoProfissional = {
  avaliacaoId: number;
  atendimentoId: number;
  profissionalId: number;
  nota: number;
  comentario: string | null;
  criadoEm: string;
};

export type AvaliacaoProfissionalRequest = {
  atendimentoId: number;
  nota: number;
  comentario?: string | null;
};
