import { http } from './http';

export type ChatResponse = {
  id: string;
  answer: string;
  suggestedPrompts: string[];
  chunks?: string[];
  contextUsed?: boolean;
  sources?: Array<{
    documentId?: string;
    filename?: string;
    chunkIndex?: number;
    distance?: number;
  }>;
};

export type ChatPayload = {
  message: string;
  language?: string;
};

export const chatRequest = async (payload: ChatPayload) => {
  const { data } = await http.post<ChatResponse>('/ai/chat', payload);
  return data;
};

export type ChatHistory = {
  _id: string;
  question: string;
  answer: string;
  language: string;
  title: string;
  category: string;
  starred: boolean;
  createdAt: string;
};

export const getChatsRequest = async () => {
  const { data } = await http.get<{ chats: ChatHistory[] }>('/chats');
  return data.chats;
};

export const toggleStarChatRequest = async (id: string) => {
  const { data } = await http.patch<{ chat: ChatHistory }>(`/chats/${id}/star`);
  return data.chat;
};

export const deleteChatRequest = async (id: string) => {
  const { data } = await http.delete<{ message: string }>(`/chats/${id}`);
  return data;
};
