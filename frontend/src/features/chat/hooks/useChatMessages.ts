import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, type ChatMessage } from '@/shared/api';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { useToast } from '@/shared/hooks';
import type { ChatMessageFormData } from '@/lib/zod/schemas';

/**
 * Hook to fetch chat messages
 */
export const useChatMessages = (chatId: string) => {
  return useQuery<ChatMessage[]>({
    queryKey: QUERY_KEYS.CHAT.MESSAGES(chatId),
    queryFn: () => chatApi.getChatMessages(chatId),
    enabled: !!chatId,
  });
};

/**
 * Hook to send message
 */
export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation({
    mutationFn: (data: ChatMessageFormData) =>
      chatApi.sendMessage(chatId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.MESSAGES(chatId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.DETAIL(chatId),
      });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to send message');
    },
  });
};
