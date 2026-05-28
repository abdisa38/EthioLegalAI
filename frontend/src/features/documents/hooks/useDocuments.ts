import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDocumentRequest,
  getDocumentsRequest,
} from "../../../app/api/documents";

export const documentKeys = {
  all: ["documents"] as const,
};

export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.all,
    queryFn: getDocumentsRequest,
    meta: { toastOnError: true },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocumentRequest,
    meta: { toastOnError: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

