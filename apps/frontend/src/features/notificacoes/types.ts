export type PlataformaPush = 'ANDROID';

export type RegistrarDispositivoPushRequest = {
  plataforma: PlataformaPush;
  token: string;
};

export type DispositivoPushResponse = {
  id: number;
  usuarioId: number;
  plataforma: PlataformaPush;
  tokenMascarado: string;
  ativo: boolean;
  ultimoUsoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type TestePushResponse = {
  providerConfigurado: boolean;
  totalDispositivos: number;
  enviados: number;
  mensagem: string;
};
