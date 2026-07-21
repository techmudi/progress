const ACCESS_TOKEN_KEY = 'progress_dashboard_access_token';
const USER_KEY = 'progress_dashboard_user';

function safeParse(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (!token) {
    removeAccessToken();
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  return safeParse(window.localStorage.getItem(USER_KEY));
}

export function setStoredUser(user) {
  if (!user) {
    window.localStorage.removeItem(USER_KEY);
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  removeAccessToken();
  window.localStorage.removeItem(USER_KEY);
}

export const authStorageKeys = {
  accessToken: ACCESS_TOKEN_KEY,
  user: USER_KEY,
};
