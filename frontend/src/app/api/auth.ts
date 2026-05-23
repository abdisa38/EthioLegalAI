import { http } from './http';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  languagePreference: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  languagePreference?: string;
};

export const loginRequest = async (payload: LoginPayload) => {
  const { data } = await http.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const registerRequest = async (payload: RegisterPayload) => {
  const { data } = await http.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const profileRequest = async () => {
  const { data } = await http.get<{ user: AuthUser }>('/auth/me');
  return data.user;
};
