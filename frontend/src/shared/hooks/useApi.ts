import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import type { AxiosError } from 'axios';

// Generic useQuery wrapper with error handling
export function useApiQuery<TData = unknown>(
  key: string | (string | object)[],
  fn: () => Promise<TData>,
  options?: UseQueryOptions<TData, AxiosError>,
) {
  return useQuery<TData, AxiosError>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: fn,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

// Generic useMutation wrapper
export function useApiMutation<TData = unknown, TVariables = void>(
  fn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, AxiosError, TVariables>,
) {
  return useMutation<TData, AxiosError, TVariables>({
    mutationFn: fn,
    ...options,
  });
}

// Chat API hooks
export function useChat(conversationId?: string) {
  return useApiQuery(
    ['chat', conversationId],
    async () => {
      const { data } = await http.get(`/chat${conversationId ? `/${conversationId}` : ''}`);
      return data;
    },
  );
}

export function useSendMessage() {
  return useApiMutation(
    async (payload: { message: string; conversationId?: string }) => {
      const { data } = await http.post('/chat/message', payload);
      return data;
    },
  );
}

// Document API hooks
export function useDocuments() {
  return useApiQuery(
    ['documents'],
    async () => {
      const { data } = await http.get('/documents');
      return data;
    },
  );
}

export function useUploadDocument() {
  return useApiMutation(
    async (payload: FormData) => {
      const { data } = await http.post('/documents/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  );
}

export function useDocument(documentId: string) {
  return useApiQuery(
    ['document', documentId],
    async () => {
      const { data } = await http.get(`/documents/${documentId}`);
      return data;
    },
  );
}

// Contract API hooks
export function useAnalyzeContract() {
  return useApiMutation(
    async (payload: { contractId: string; analysisType: string }) => {
      const { data } = await http.post('/contracts/analyze', payload);
      return data;
    },
  );
}

// AI Assistant hooks
export function useLaborAssistant() {
  return useApiMutation(
    async (query: string) => {
      const { data } = await http.post('/ai/labor-assistant', { query });
      return data;
    },
  );
}

export function useTenantAssistant() {
  return useApiMutation(
    async (query: string) => {
      const { data } = await http.post('/ai/tenant-assistant', { query });
      return data;
    },
  );
}

// Generic fetch with caching
export function useCachedData<TData = unknown>(
  key: string,
  url: string,
  options?: UseQueryOptions<TData, AxiosError>,
) {
  return useApiQuery<TData>(
    key,
    async () => {
      const { data } = await http.get<TData>(url);
      return data;
    },
    options,
  );
}
