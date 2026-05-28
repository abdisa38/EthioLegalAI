import { http } from './http';

export type DocumentRecord = {
  _id: string;
  filename: string;
  cloudinaryUrl: string;
  summary?: string;
  riskScore?: string;
  createdAt: string;
  mimeType?: string;
  fileSize?: number;
};

export const uploadDocumentRequest = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await http.post<{ document: DocumentRecord }>(
    '/documents/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: event => {
        if (!event.total) return;
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress?.(progress);
      },
    }
  );

  return data.document;
};

export const getDocumentsRequest = async () => {
  const { data } = await http.get<{ documents: DocumentRecord[] }>('/documents');
  return data.documents;
};

export const deleteDocumentRequest = async (id: string) => {
  const { data } = await http.delete<{ message: string }>(`/documents/${id}`);
  return data;
};
