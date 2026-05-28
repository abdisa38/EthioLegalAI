import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  DocumentUpdateFormData,
  DocumentFilterData,
} from '@/lib/zod/schemas';

export interface Document {
  _id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: string;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  summary?: string;
  riskScore?: number;
  analysis?: {
    docType?: string;
    riskScore?: number;
    keyTerms?: string[];
    summary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Document API Service
 * Centralized document API calls
 */
export const documentApi = {
  /**
   * Get all documents with filters
   */
  getDocuments: async (
    filters?: Partial<DocumentFilterData>
  ): Promise<PaginatedResponse<Document>> => {
    const response = await apiClient.get<PaginatedResponse<Document>>(
      API_ENDPOINTS.DOCUMENTS.LIST,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get single document by ID
   */
  getDocument: async (id: string): Promise<Document> => {
    const response = await apiClient.get<{ document: Document }>(
      API_ENDPOINTS.DOCUMENTS.GET(id)
    );
    return response.data.document;
  },

  /**
   * Upload document
   */
  uploadDocument: async (formData: FormData): Promise<Document> => {
    const response = await apiClient.post<{ document: Document }>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.document;
  },

  /**
   * Update document
   */
  updateDocument: async (
    id: string,
    data: DocumentUpdateFormData
  ): Promise<Document> => {
    const response = await apiClient.patch<{ document: Document }>(
      API_ENDPOINTS.DOCUMENTS.UPDATE(id),
      data
    );
    return response.data.document;
  },

  /**
   * Delete document
   */
  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.DOCUMENTS.DELETE(id));
  },

  /**
   * Download document
   */
  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(
      API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id),
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Analyze document
   */
  analyzeDocument: async (id: string): Promise<Document> => {
    const response = await apiClient.post<{ document: Document }>(
      API_ENDPOINTS.DOCUMENTS.ANALYZE(id)
    );
    return response.data.document;
  },
};
