import { apiRequest } from '../../services/apiClient';
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  CadastroClienteRequest,
  CadastroProfissionalRequest,
  CadastroUsuarioResponse,
  UsuarioAutenticado,
} from './types';

export function loginRequest(payload: AuthLoginRequest) {
  return apiRequest<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUserRequest(token: string) {
  return apiRequest<UsuarioAutenticado>('/auth/me', {
    method: 'GET',
    token,
  });
}

export function registerClienteRequest(payload: CadastroClienteRequest) {
  return apiRequest<CadastroUsuarioResponse>('/usuarios/clientes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerProfissionalRequest(payload: CadastroProfissionalRequest) {
  return apiRequest<CadastroUsuarioResponse>('/usuarios/profissionais', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
