export const TOKEN_STORAGE_KEY = 'leidy_cleaner_token';

const LEGACY_TOKEN_STORAGE_KEYS = ['leidy.cleaner.accessToken'];
export const AUTH_STORAGE_KEYS = [TOKEN_STORAGE_KEY, ...LEGACY_TOKEN_STORAGE_KEYS];

export const authStorage = {
  getToken() {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token) {
      return token;
    }

    const legacyToken = LEGACY_TOKEN_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) ?? null;

    if (legacyToken) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken);
      LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    }

    return legacyToken;
  },
  setToken(token: string) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  },
  clearToken() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  },
};
