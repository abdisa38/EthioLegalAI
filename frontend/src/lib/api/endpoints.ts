/**
 * API Endpoint Constants
 * Centralized endpoint definitions for type safety and maintainability
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // Chat endpoints
  CHAT: {
    LIST: '/chat',
    CREATE: '/chat',
    GET: (id: string) => `/chat/${id}`,
    UPDATE: (id: string) => `/chat/${id}`,
    DELETE: (id: string) => `/chat/${id}`,
    MESSAGES: (id: string) => `/chat/${id}/messages`,
    RATE: (id: string) => `/chat/${id}/rate`,
    STAR: (id: string) => `/chat/${id}/star`,
  },

  // Document endpoints
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    GET: (id: string) => `/documents/${id}`,
    UPDATE: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    ANALYZE: (id: string) => `/documents/${id}/analyze`,
  },

  // Contract endpoints
  CONTRACTS: {
    ANALYZE: '/contracts/analyze',
    REVIEW: '/contracts/review',
    GENERATE: '/contracts/generate',
  },

  // AI Assistant endpoints
  AI: {
    CHAT: '/ai/chat',
    TENANT_ASSISTANT: '/ai/tenant-assistant',
    LABOR_ASSISTANT: '/ai/labor-assistant',
    STREAM: '/ai/stream',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    PREFERENCES: '/user/preferences',
    ANALYTICS: '/user/analytics',
    ACTIVITY: '/user/activity',
  },
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  AUTH: {
    PROFILE: ['auth', 'profile'] as const,
  },
  CHAT: {
    LIST: (filters?: Record<string, unknown>) => ['chats', filters] as const,
    DETAIL: (id: string) => ['chat', id] as const,
    MESSAGES: (id: string) => ['chat', id, 'messages'] as const,
  },
  DOCUMENTS: {
    LIST: (filters?: Record<string, unknown>) => ['documents', filters] as const,
    DETAIL: (id: string) => ['document', id] as const,
  },
  USER: {
    PROFILE: ['user', 'profile'] as const,
    ANALYTICS: ['user', 'analytics'] as const,
    ACTIVITY: ['user', 'activity'] as const,
  },
} as const;
