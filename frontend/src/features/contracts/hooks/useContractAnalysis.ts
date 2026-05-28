import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  analyzeContractRequest,
  getContractAnalysisRequest,
} from "../api/contracts";

export const contractKeys = {
  analysis: (documentId: string) => ["contract-analysis", documentId] as const,
};

export function useContractAnalysis(documentId: string | null) {
  return useQuery({
    queryKey: documentId ? contractKeys.analysis(documentId) : ["contract-analysis", "none"],
    queryFn: () => getContractAnalysisRequest(documentId as string),
    enabled: Boolean(documentId),
    meta: { toastOnError: true },
  });
}

export function useAnalyzeContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyzeContractRequest,
    meta: { toastOnError: true },
    onSuccess: async (result) => {
      const documentId = result.analysis.documentId || result.document?._id;
      if (documentId) {
        await queryClient.invalidateQueries({
          queryKey: contractKeys.analysis(documentId),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

