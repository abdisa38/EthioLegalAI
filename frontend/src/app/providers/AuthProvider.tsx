import { createContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, setAuthToken, clearAuthToken } from '@/lib/api/client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/api/endpoints';
import type { LoginFormData, RegisterFormData } from '@/lib/zod/schemas';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  languagePreference: 'en' | 'am' | 'or';
  isEmailVerified: boolean;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: Omit<RegisterFormData, 'confirmPassword' | 'acceptTerms'>) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const queryClient = useQueryClient();

  // Fetch user profile
  const {
    data: profileData,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: QUERY_KEYS.AUTH.PROFILE,
    queryFn: async () => {
      const response = await apiClient.get<{ user: AuthUser }>(
        API_ENDPOINTS.AUTH.PROFILE
      );
      return response.data.user;
    },
    enabled: !!localStorage.getItem('ethiolegal_token'),
    retry: false,
  });

  // Update user state when profile data changes
  useEffect(() => {
    if (profileData) {
      setUser(profileData);
    }
  }, [profileData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiClient.post<{
        token: string;
        user: AuthUser;
      }>(API_ENDPOINTS.AUTH.LOGIN, data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setUser(data.user);
      queryClient.setQueryData(QUERY_KEYS.AUTH.PROFILE, data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (
      data: Omit<RegisterFormData, 'confirmPassword' | 'acceptTerms'>
    ) => {
      const response = await apiClient.post<{
        token: string;
        user: AuthUser;
      }>(API_ENDPOINTS.AUTH.REGISTER, data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setUser(data.user);
      queryClient.setQueryData(QUERY_KEYS.AUTH.PROFILE, data.user);
    },
  });

  // Login function
  const login = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
  };

  // Register function
  const register = async (
    data: Omit<RegisterFormData, 'confirmPassword' | 'acceptTerms'>
  ) => {
    await registerMutation.mutateAsync(data);
  };

  // Logout function
  const logout = () => {
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => undefined);
    clearAuthToken();
    setUser(null);
    queryClient.clear();
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refetchUser,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
