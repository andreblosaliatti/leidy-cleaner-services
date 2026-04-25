import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError } from '../../services/apiClient';
import {
  getCurrentUserRequest,
  loginRequest,
  registerClienteRequest,
  registerProfissionalRequest,
} from './authApi';
import { authStorage } from './authStorage';
import type {
  AuthLoginRequest,
  CadastroClienteRequest,
  CadastroProfissionalRequest,
  CadastroUsuarioResponse,
  UsuarioAutenticado,
} from './types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  token: string | null;
  user: UsuarioAutenticado | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (payload: AuthLoginRequest) => Promise<UsuarioAutenticado>;
  registerCliente: (payload: CadastroClienteRequest) => Promise<CadastroUsuarioResponse>;
  registerProfissional: (payload: CadastroProfissionalRequest) => Promise<CadastroUsuarioResponse>;
  refreshUser: () => Promise<UsuarioAutenticado | null>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [user, setUser] = useState<UsuarioAutenticado | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (authStorage.getToken() ? 'loading' : 'anonymous'));

  const clearSession = useCallback(() => {
    authStorage.clearToken();
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const hydrateUser = useCallback(
    async (activeToken: string | null) => {
      if (!activeToken) {
        clearSession();
        return null;
      }

      setStatus('loading');

      try {
        const currentUser = await getCurrentUserRequest(activeToken);
        setUser(currentUser);
        setStatus('authenticated');
        return currentUser;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          return null;
        }

        clearSession();
        throw error;
      }
    },
    [clearSession],
  );

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      const storedToken = authStorage.getToken();

      if (!storedToken) {
        if (isActive) {
          clearSession();
        }
        return;
      }

      try {
        const currentUser = await getCurrentUserRequest(storedToken);

        if (isActive) {
          setToken(storedToken);
          setUser(currentUser);
          setStatus('authenticated');
        }
      } catch {
        if (isActive) {
          clearSession();
        }
      }
    }

    void loadSession();

    return () => {
      isActive = false;
    };
  }, [clearSession]);

  const login = useCallback(async (payload: AuthLoginRequest) => {
    const response = await loginRequest(payload);

    authStorage.setToken(response.accessToken);
    setToken(response.accessToken);
    setUser(response.usuario);
    setStatus('authenticated');

    return response.usuario;
  }, []);

  const refreshUser = useCallback(() => hydrateUser(token), [hydrateUser, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      status,
      isAuthenticated: status === 'authenticated' && Boolean(user),
      login,
      registerCliente: registerClienteRequest,
      registerProfissional: registerProfissionalRequest,
      refreshUser,
      logout: clearSession,
    }),
    [clearSession, login, refreshUser, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
