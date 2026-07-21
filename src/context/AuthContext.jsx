import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredSession,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from '../services/authStorage';
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../services/authService';
import { resetUnauthorizedNotification, setUnauthorizedHandler } from '../services/sessionEvents';

const AuthContext = createContext(null);

function includesAny(values = [], required = []) {
  return required.some((value) => values.includes(value));
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const unregister = setUnauthorizedHandler(() => {
      clearSession();
    });

    return unregister;
  }, [clearSession]);

  const refreshCurrentUser = useCallback(async (options = {}) => {
    const storedToken = getAccessToken();

    if (!storedToken) {
      clearSession();
      return null;
    }

    const result = await getCurrentUser({ signal: options.signal });
    setToken(storedToken);
    setUser(result.user);
    setStoredUser(result.user);
    resetUnauthorizedNotification();

    return result.user;
  }, [clearSession]);

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      const storedToken = getAccessToken();

      if (!storedToken) {
        clearSession();
        setIsRestoringSession(false);
        return;
      }

      setToken(storedToken);

      try {
        await refreshCurrentUser({ signal: controller.signal });
      } catch (error) {
        if (error?.type !== 'cancelled') {
          clearSession();
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsRestoringSession(false);
        }
      }
    }

    restoreSession();

    return () => controller.abort();
  }, [clearSession, refreshCurrentUser]);

  const login = useCallback(async (credentials) => {
    setIsLoggingIn(true);

    try {
      const result = await loginRequest(credentials);

      setAccessToken(result.token);
      setStoredUser(result.user);
      setToken(result.token);
      setUser(result.user);
      resetUnauthorizedNotification();

      return result.user;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Local logout should still complete if the server is unreachable.
    } finally {
      clearSession();
      resetUnauthorizedNotification();
    }
  }, [clearSession]);

  const roles = user?.roles || [];
  const permissions = user?.permissions || [];

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isRestoringSession,
    isLoggingIn,
    login,
    logout,
    refreshCurrentUser,
    hasRole: (role) => roles.includes(role),
    hasAnyRole: (requiredRoles) => includesAny(roles, requiredRoles),
    hasPermission: (permission) => permissions.includes(permission),
    hasAnyPermission: (requiredPermissions) => includesAny(permissions, requiredPermissions),
  }), [isLoggingIn, isRestoringSession, login, logout, permissions, refreshCurrentUser, roles, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
