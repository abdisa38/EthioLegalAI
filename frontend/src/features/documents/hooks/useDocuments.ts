import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, type Document, type PaginatedResponse } from '@/shared/api';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { useToast } from '@/shared/hooks';
import type { DocumentUpdateFormData, DocumentFilterData } from '@/lib/zod/schemas';

/**
 * Hook to fetch all documents with filters
 */
export const useDocuments = (filters?: Partial<DocumentFilterData>) => {
  return useQuery<PaginatedResponse<Document>>({
    queryKey: QUERY_KEYS.DOCUMENTS.LIST(filters),
    queryFn: () => documentApi.getDocuments(filters),
  });
};

/**
 * Hook to fetch single document
 */
export const useDocument = (id: string) => {
  return useQuery<Document>({
    queryKey: QUERY_KEYS.DOCUMENTS.DETAIL(id),
    queryFn: () => documentApi.getDocument(id),
    enabled: !!id,
  });
};

/**
 * Hook to upload document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (formData: FormData) => documentApi.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.LIST() });
      success('Document uploaded successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to upload document');
    },
  });
};

/**
 * Hook to update document
 */
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentUpdateFormData }) =>
      documentApi.updateDocument(id, data),
    onSuccess: (updatedDoc) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.LIST() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DOCUMENTS.DETAIL(updatedDoc._id),
      });
      success('Document updated successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update document');
    },
  });
};

/**
 * Hook to delete document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.LIST() });
      success('Document deleted successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete document');
    },
  });
};

/**
 * Hook to analyze document
 */
export const useAnalyzeDocument = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => documentApi.analyzeDocument(id),
    onSuccess: (analyzedDoc) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS.LIST() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DOCUMENTS.DETAIL(analyzedDoc._id),
      });
      success('Document analyzed successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to analyze document');
    },
  });
};

/**
 * Hook to download document
 */
export const useDownloadDocument = () => {
  const { error } = useToast();

  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const blob = await documentApi.downloadDocument(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to download document');
    },
  });
};
