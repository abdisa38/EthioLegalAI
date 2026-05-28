import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from '../api/auth';
import { loginRequest, profileRequest, registerRequest, logoutRequest } from '../api/auth';
import { TOKEN_KEY } from '../api/http';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await profileRequest();
      setUser(profile);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    const onLogout = () => {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (payload: LoginPayload) => {
    const result = await loginRequest(payload);
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
  };

  const register = async (payload: RegisterPayload) => {
    const result = await registerRequest(payload);
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
  };

  const logout = () => {
    logoutRequest().catch(() => undefined);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
