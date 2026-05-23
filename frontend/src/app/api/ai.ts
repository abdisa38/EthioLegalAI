import { http } from './http';

export type ChatResponse = {
  answer: string;
  suggestedPrompts: string[];
};

export type ChatPayload = {
  message: string;
  language?: string;
};

export const chatRequest = async (payload: ChatPayload) => {
  const { data } = await http.post<ChatResponse>('/ai/chat', payload);
  return data;
};
