import { http } from './http';

export type LaborAssistantPayload = {
  message: string;
  language?: string;
};

export type LaborAssistantResponse = {
  answer: string;
  suggestedPrompts: string[];
};

export const askLaborAssistantRequest = async (payload: LaborAssistantPayload) => {
  const { data } = await http.post<LaborAssistantResponse>('/assistants/labor/ask', payload);
  return data;
};
