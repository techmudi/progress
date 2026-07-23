const ACCESS_TOKEN_KEY = 'progress_dashboard_access_token';
const USER_KEY = 'progress_dashboard_user';
const DEVELOPMENT_TOKEN = 'development-dashboard-token';

// MODE is "development" only when Vite is running its development server.
// This deliberately excludes test and production builds.
export const isDevelopmentMode = import.meta.env.MODE === 'development';

const developmentUser = {
  id: 'development-user',
  name: 'Development Admin',
  email: 'dev@example.test',
  roles: ['admin'],
  permissions: [
    'dashboard.view',
    'reports.view',
    'users.view',
    'users.create',
    'users.update',
    'users.deactivate',
    'tracks.view',
    'tracks.manage',
    'interns.view',
    'interns.manage',
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.manage',
  ],
};

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

export function ensureDevelopmentSession() {
  if (!isDevelopmentMode || getAccessToken()) return false;

  setAccessToken(DEVELOPMENT_TOKEN);
  setStoredUser(developmentUser);
  return true;
}

export function isDevelopmentSession(token = getAccessToken()) {
  return isDevelopmentMode && token === DEVELOPMENT_TOKEN;
}

export const authStorageKeys = {
  accessToken: ACCESS_TOKEN_KEY,
  user: USER_KEY,
};
