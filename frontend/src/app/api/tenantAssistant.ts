import { http } from './http';

export type TenantAssistantPayload = {
  message: string;
  language?: string;
};

export type TenantAssistantResponse = {
  answer: string;
  suggestedPrompts: string[];
};

export const askTenantAssistantRequest = async (payload: TenantAssistantPayload) => {
  const { data } = await http.post<TenantAssistantResponse>('/assistants/tenant/ask', payload);
  return data;
};
