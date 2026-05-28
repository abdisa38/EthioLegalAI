import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ChatMessageFormData,
  CreateChatFormData,
  UpdateChatFormData,
  ChatRatingFormData,
  ChatFilterData,
} from '@/lib/zod/schemas';

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  category: string;
  language: string;
  starred: boolean;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Chat API Service
 * Centralized chat API calls
 */
export const chatApi = {
  /**
   * Get all chats with filters
   */
  getChats: async (
    filters?: Partial<ChatFilterData>
  ): Promise<PaginatedResponse<Chat>> => {
    const response = await apiClient.get<PaginatedResponse<Chat>>(
      API_ENDPOINTS.CHAT.LIST,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get single chat by ID
   */
  getChat: async (id: string): Promise<Chat> => {
    const response = await apiClient.get<{ chat: Chat }>(
      API_ENDPOINTS.CHAT.GET(id)
    );
    return response.data.chat;
  },

  /**
   * Create new chat
   */
  createChat: async (data: CreateChatFormData): Promise<Chat> => {
    const response = await apiClient.post<{ chat: Chat }>(
      API_ENDPOINTS.CHAT.CREATE,
      data
    );
    return response.data.chat;
  },

  /**
   * Update chat
   */
  updateChat: async (
    id: string,
    data: UpdateChatFormData
  ): Promise<Chat> => {
    const response = await apiClient.patch<{ chat: Chat }>(
      API_ENDPOINTS.CHAT.UPDATE(id),
      data
    );
    return response.data.chat;
  },

  /**
   * Delete chat
   */
  deleteChat: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CHAT.DELETE(id));
  },

  /**
   * Get chat messages
   */
  getChatMessages: async (id: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<{ messages: ChatMessage[] }>(
      API_ENDPOINTS.CHAT.MESSAGES(id)
    );
    return response.data.messages;
  },

  /**
   * Send message to chat
   */
  sendMessage: async (
    id: string,
    data: ChatMessageFormData
  ): Promise<ChatMessage> => {
    const response = await apiClient.post<{ message: ChatMessage }>(
      API_ENDPOINTS.CHAT.MESSAGES(id),
      data
    );
    return response.data.message;
  },

  /**
   * Rate chat
   */
  rateChat: async (
    id: string,
    data: ChatRatingFormData
  ): Promise<Chat> => {
    const response = await apiClient.post<{ chat: Chat }>(
      API_ENDPOINTS.CHAT.RATE(id),
      data
    );
    return response.data.chat;
  },

  /**
   * Toggle star on chat
   */
  toggleStar: async (id: string): Promise<Chat> => {
    const response = await apiClient.post<{ chat: Chat }>(
      API_ENDPOINTS.CHAT.STAR(id)
    );
    return response.data.chat;
  },
};
