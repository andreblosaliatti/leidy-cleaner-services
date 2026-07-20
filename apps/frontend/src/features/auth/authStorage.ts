import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

import type { UsuarioAutenticado } from './types';

export const TOKEN_STORAGE_KEY = 'leidy_cleaner_token';
export const USER_STORAGE_KEY = 'leidy_cleaner_authenticated_user';
export const LOGOUT_TOMBSTONE_STORAGE_KEY = 'leidy_cleaner_logout_tombstone';

const LEGACY_TOKEN_STORAGE_KEYS = ['leidy.cleaner.accessToken'];
export const AUTH_STORAGE_KEYS = [TOKEN_STORAGE_KEY, USER_STORAGE_KEY, LOGOUT_TOMBSTONE_STORAGE_KEY, ...LEGACY_TOKEN_STORAGE_KEYS];

type StoredAuthSession = {
  token: string | null;
  user: UsuarioAutenticado | null;
};

let cachedSession = readInitialSession();
let hydrated = !shouldUseNativeStorage();

export const authStorage = {
  getToken() {
    return cachedSession.token;
  },
  getUser() {
    return cachedSession.user;
  },
  isHydrated() {
    return hydrated;
  },
  syncFromBrowserStorage() {
    if (shouldUseNativeStorage()) {
      return cachedSession;
    }

    cachedSession = readWebSession();
    hydrated = true;
    return cachedSession;
  },
  async hydrate() {
    if (!shouldUseNativeStorage()) {
      cachedSession = readWebSession();
      hydrated = true;
      return cachedSession;
    }

    if (hasLogoutTombstone()) {
      cachedSession = emptySession();
      hydrated = true;
      return cachedSession;
    }

    try {
      cachedSession = await readNativeSession();
    } catch {
      cachedSession = readWebSession();
    }

    hydrated = true;
    return cachedSession;
  },
  async setSession(token: string, user: UsuarioAutenticado) {
    const session = { token, user };
    cachedSession = session;
    hydrated = true;
    clearLogoutTombstone();

    if (shouldUseNativeStorage()) {
      try {
        await Promise.all([
          Preferences.set({ key: TOKEN_STORAGE_KEY, value: token }),
          Preferences.set({ key: USER_STORAGE_KEY, value: JSON.stringify(user) }),
        ]);
      } catch {
        writeWebSession(session);
        return;
      }

      writeWebSession(session);
      return;
    }

    writeWebSession(session);
  },
  async clearSession() {
    cachedSession = emptySession();
    hydrated = true;
    writeLogoutTombstone();

    if (shouldUseNativeStorage()) {
      try {
        await Promise.all([
          Preferences.remove({ key: TOKEN_STORAGE_KEY }),
          Preferences.remove({ key: USER_STORAGE_KEY }),
        ]);
      } catch {
        clearWebSession();
        return;
      }
    }

    clearWebSession();
    clearLogoutTombstone();
  },
};

function emptySession(): StoredAuthSession {
  return { token: null, user: null };
}

function readInitialSession() {
  if (shouldUseNativeStorage()) {
    return emptySession();
  }

  return readWebSession();
}

function shouldUseNativeStorage() {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Preferences');
}

function canUseWebStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function hasLogoutTombstone() {
  if (!canUseWebStorage()) {
    return false;
  }

  return window.localStorage.getItem(LOGOUT_TOMBSTONE_STORAGE_KEY) === '1';
}

function readWebSession(): StoredAuthSession {
  if (!canUseWebStorage()) {
    return emptySession();
  }

  const storage = window.localStorage;
  const token = readWebToken(storage);
  const user = readStoredUser(storage.getItem(USER_STORAGE_KEY));
  return { token, user };
}

function readWebToken(storage: Storage) {
  const token = storage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    return token;
  }

  const legacyToken = LEGACY_TOKEN_STORAGE_KEYS.map((key) => storage.getItem(key)).find(Boolean) ?? null;

  if (legacyToken) {
    storage.setItem(TOKEN_STORAGE_KEY, legacyToken);
    LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
  }

  return legacyToken;
}

async function readNativeSession(): Promise<StoredAuthSession> {
  const [{ value: storedToken }, { value: storedUser }] = await Promise.all([
    Preferences.get({ key: TOKEN_STORAGE_KEY }),
    Preferences.get({ key: USER_STORAGE_KEY }),
  ]);

  let token = storedToken;
  let user = readStoredUser(storedUser);

  if (!token && canUseWebStorage()) {
    const migratedWebSession = readWebSession();

    token = migratedWebSession.token;
    user = user ?? migratedWebSession.user;

    if (token) {
      await Promise.all([
        Preferences.set({ key: TOKEN_STORAGE_KEY, value: token }),
        user
          ? Preferences.set({ key: USER_STORAGE_KEY, value: JSON.stringify(user) })
          : Preferences.remove({ key: USER_STORAGE_KEY }),
      ]);
      writeWebSession({ token, user });
    }
  }

  return { token, user };
}

function readStoredUser(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UsuarioAutenticado;
  } catch {
    return null;
  }
}

function writeWebSession(session: StoredAuthSession) {
  if (!canUseWebStorage()) {
    return;
  }

  const storage = window.localStorage;

  if (session.token) {
    storage.setItem(TOKEN_STORAGE_KEY, session.token);
  } else {
    storage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (session.user) {
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
  } else {
    storage.removeItem(USER_STORAGE_KEY);
  }

  LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
}

function clearWebSession() {
  if (!canUseWebStorage()) {
    return;
  }

  const storage = window.localStorage;
  storage.removeItem(TOKEN_STORAGE_KEY);
  storage.removeItem(USER_STORAGE_KEY);
  LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
}

function writeLogoutTombstone() {
  if (!canUseWebStorage()) {
    return;
  }

  window.localStorage.setItem(LOGOUT_TOMBSTONE_STORAGE_KEY, '1');
}

function clearLogoutTombstone() {
  if (!canUseWebStorage()) {
    return;
  }

  window.localStorage.removeItem(LOGOUT_TOMBSTONE_STORAGE_KEY);
}
