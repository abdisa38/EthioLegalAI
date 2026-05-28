import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, type Chat, type PaginatedResponse } from '@/shared/api';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { useToast } from '@/shared/hooks';
import type {
  CreateChatFormData,
  UpdateChatFormData,
  ChatFilterData,
} from '@/lib/zod/schemas';

/**
 * Hook to fetch all chats with filters
 */
export const useChats = (filters?: Partial<ChatFilterData>) => {
  return useQuery<PaginatedResponse<Chat>>({
    queryKey: QUERY_KEYS.CHAT.LIST(filters),
    queryFn: () => chatApi.getChats(filters),
  });
};

/**
 * Hook to fetch single chat
 */
export const useChat = (id: string) => {
  return useQuery<Chat>({
    queryKey: QUERY_KEYS.CHAT.DETAIL(id),
    queryFn: () => chatApi.getChat(id),
    enabled: !!id,
  });
};

/**
 * Hook to create new chat
 */
export const useCreateChat = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateChatFormData) => chatApi.createChat(data),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT.LIST() });
      success('Chat created successfully');
      return newChat;
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create chat');
    },
  });
};

/**
 * Hook to update chat
 */
export const useUpdateChat = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChatFormData }) =>
      chatApi.updateChat(id, data),
    onSuccess: (updatedChat) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT.LIST() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.DETAIL(updatedChat._id),
      });
      success('Chat updated successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update chat');
    },
  });
};

/**
 * Hook to delete chat
 */
export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => chatApi.deleteChat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT.LIST() });
      success('Chat deleted successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete chat');
    },
  });
};

/**
 * Hook to toggle star on chat
 */
export const useToggleStar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatApi.toggleStar(id),
    onSuccess: (updatedChat) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT.LIST() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.DETAIL(updatedChat._id),
      });
    },
  });
};
