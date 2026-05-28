import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteChatRequest,
  getChatsRequest,
  toggleStarChatRequest,
} from "../api/ai";

export const chatKeys = {
  all: ["chats"] as const,
};

export function useChatHistory() {
  return useQuery({
    queryKey: chatKeys.all,
    queryFn: getChatsRequest,
    meta: { toastOnError: true },
  });
}

export function useToggleStarChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleStarChatRequest,
    meta: { toastOnError: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChatRequest,
    meta: { toastOnError: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

