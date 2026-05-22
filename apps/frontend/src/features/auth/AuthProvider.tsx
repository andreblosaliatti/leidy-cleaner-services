import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { ApiError } from '../../services/apiClient';
import {
  getCurrentUserRequest,
  loginRequest,
  registerClienteRequest,
  registerProfissionalCompletoRequest,
  registerProfissionalRequest,
} from './authApi';
import { AUTH_STORAGE_KEYS, authStorage } from './authStorage';
import type {
  AuthLoginRequest,
  CadastroClienteRequest,
  CadastroProfissionalCompletoRequest,
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
  registerProfissionalCompleto: (payload: CadastroProfissionalCompletoRequest) => Promise<CadastroUsuarioResponse>;
  refreshUser: () => Promise<UsuarioAutenticado | null>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const sessionRequestRef = useRef<{ token: string; promise: Promise<UsuarioAutenticado> } | null>(null);
  const sessionRevisionRef = useRef(0);
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [user, setUser] = useState<UsuarioAutenticado | null>(() => authStorage.getUser());
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (!authStorage.isHydrated()) {
      return 'loading';
    }

    return authStorage.getToken() ? 'loading' : 'anonymous';
  });

  const clearSession = useCallback(() => {
    sessionRevisionRef.current += 1;
    sessionRequestRef.current = null;
    void authStorage.clearSession().catch(() => undefined);
    queryClient.clear();
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, [queryClient]);

  const applyAuthenticatedSession = useCallback((activeToken: string, currentUser: UsuarioAutenticado) => {
    setToken(activeToken);
    setUser(currentUser);
    setStatus('authenticated');
    void authStorage.setSession(activeToken, currentUser).catch(() => undefined);
  }, []);

  const loadCurrentUser = useCallback((activeToken: string) => {
    if (sessionRequestRef.current?.token === activeToken) {
      return sessionRequestRef.current.promise;
    }

    const request = getCurrentUserRequest(activeToken);
    sessionRequestRef.current = { token: activeToken, promise: request };

    void request.finally(() => {
      if (sessionRequestRef.current?.promise === request) {
        sessionRequestRef.current = null;
      }
    }).catch(() => undefined);

    return request;
  }, []);

  const hydrateUser = useCallback(
    async (activeToken: string | null, fallbackUser?: UsuarioAutenticado | null) => {
      if (!activeToken) {
        clearSession();
        return null;
      }

      const requestRevision = sessionRevisionRef.current;
      setStatus('loading');

      try {
        const currentUser = await loadCurrentUser(activeToken);

        if (sessionRevisionRef.current !== requestRevision || authStorage.getToken() !== activeToken) {
          return null;
        }

        applyAuthenticatedSession(activeToken, currentUser);
        return currentUser;
      } catch (error) {
        if (sessionRevisionRef.current !== requestRevision || authStorage.getToken() !== activeToken) {
          return null;
        }

        if (isUnauthorized(error)) {
          clearSession();
          return null;
        }

        const restoredUser = fallbackUser ?? authStorage.getUser() ?? (token === activeToken ? user : null);

        if (restoredUser) {
          setToken(activeToken);
          setUser(restoredUser);
          setStatus('authenticated');
          return restoredUser;
        }

        setStatus('anonymous');
        throw error;
      }
    },
    [applyAuthenticatedSession, clearSession, loadCurrentUser, token, user],
  );

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      const requestRevision = sessionRevisionRef.current;
      const storedSession = await authStorage.hydrate();

      if (!isActive || sessionRevisionRef.current !== requestRevision) {
        return;
      }

      if (!storedSession.token) {
        clearSession();
        return;
      }

      setToken(storedSession.token);
      setUser(storedSession.user);
      setStatus('loading');

      try {
        const currentUser = await loadCurrentUser(storedSession.token);

        if (isActive && sessionRevisionRef.current === requestRevision && authStorage.getToken() === storedSession.token) {
          applyAuthenticatedSession(storedSession.token, currentUser);
        }
      } catch (error) {
        if (!isActive || sessionRevisionRef.current !== requestRevision || authStorage.getToken() !== storedSession.token) {
          return;
        }

        if (isUnauthorized(error)) {
          clearSession();
          return;
        }

        if (storedSession.user) {
          setToken(storedSession.token);
          setUser(storedSession.user);
          setStatus('authenticated');
          return;
        }

        setStatus('anonymous');
      }
    }

    void loadSession();

    return () => {
      isActive = false;
    };
  }, [applyAuthenticatedSession, clearSession, loadCurrentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage || (event.key && !AUTH_STORAGE_KEYS.includes(event.key))) {
        return;
      }

      const storedSession = authStorage.syncFromBrowserStorage();

      if (!storedSession.token) {
        clearSession();
        return;
      }

      if (storedSession.token !== token || (!user && storedSession.user)) {
        sessionRevisionRef.current += 1;
        sessionRequestRef.current = null;
        queryClient.clear();
        setToken(storedSession.token);
        setUser(storedSession.user);
        setStatus('loading');
        void hydrateUser(storedSession.token, storedSession.user).catch(() => undefined);
      }
    }

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [clearSession, hydrateUser, queryClient, token, user]);

  const login = useCallback(async (payload: AuthLoginRequest) => {
    const response = await loginRequest(payload);

    sessionRevisionRef.current += 1;
    sessionRequestRef.current = null;
    queryClient.clear();

    await authStorage.setSession(response.accessToken, response.usuario);
    setToken(response.accessToken);
    setUser(response.usuario);
    setStatus('authenticated');

    return response.usuario;
  }, [queryClient]);

  const refreshUser = useCallback(() => hydrateUser(token, user), [hydrateUser, token, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      status,
      isAuthenticated: status === 'authenticated' && Boolean(user),
      login,
      registerCliente: registerClienteRequest,
      registerProfissional: registerProfissionalRequest,
      registerProfissionalCompleto: registerProfissionalCompletoRequest,
      refreshUser,
      logout: clearSession,
    }),
    [clearSession, login, refreshUser, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
