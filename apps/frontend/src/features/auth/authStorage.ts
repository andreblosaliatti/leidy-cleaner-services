const TOKEN_STORAGE_KEY = 'leidy.cleaner.accessToken';

export const authStorage = {
  getToken() {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  setToken(token: string) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  clearToken() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
