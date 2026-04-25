export type TipoUsuario = 'ADMIN' | 'CLIENTE' | 'PROFISSIONAL';

export type StatusConta = 'ATIVA' | 'INATIVA' | 'BLOQUEADA' | 'PENDENTE_VERIFICACAO';

export type UsuarioAutenticado = {
  id: number;
  nomeCompleto: string;
  email: string;
  tipoUsuario: TipoUsuario;
  statusConta: StatusConta;
  roles: string[];
};

export type AuthLoginRequest = {
  email: string;
  senha: string;
};

export type AuthLoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  usuario: UsuarioAutenticado;
};

export type CadastroClienteRequest = {
  nomeCompleto: string;
  email: string;
  telefone: string;
  senha: string;
  observacoesInternas?: string;
};

export type CadastroProfissionalRequest = {
  nomeCompleto: string;
  email: string;
  telefone: string;
  senha: string;
  nomeExibicao: string;
  cpf: string;
  dataNascimento: string;
  descricao?: string;
  fotoPerfilUrl?: string;
  experienciaAnos?: number;
};

export type CadastroUsuarioResponse = {
  usuario: UsuarioAutenticado;
  perfilId: number;
};
