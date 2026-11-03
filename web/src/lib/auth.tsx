'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, getToken, setToken } from './api';
import type { AuthResponse, User } from './types';

interface AuthContextValue {
  user: User | null;
  /** true until the stored token has been checked against the API */
  initializing: boolean;
  /** true after an explicit logout in this tab (private pages then go home instead of to /login) */
  signedOut: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    const session = getToken()
      ? api<User>('/auth/me')
          .then(setUser)
          .catch((error: unknown) => {
            if (error instanceof ApiError && error.status === 401) setToken(null);
          })
      : Promise.resolve();
    session.finally(() => setInitializing(false));
  }, []);

  const applySession = useCallback(({ token, user: nextUser }: AuthResponse) => {
    setToken(token);
    setUser(nextUser);
    setSignedOut(false);
    return nextUser;
  }, []);

  const login = useCallback(
    (email: string, password: string) =>
      api<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }).then(applySession),
    [applySession],
  );

  const register = useCallback(
    (name: string, email: string, password: string) =>
      api<AuthResponse>('/auth/register', { method: 'POST', body: { name, email, password } }).then(applySession),
    [applySession],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSignedOut(true);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signedOut, login, register, logout }),
    [user, initializing, signedOut, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
