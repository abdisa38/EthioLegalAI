import { z } from 'zod';

// Document upload schema
export const documentUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .refine(
      (file) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        return allowedTypes.includes(file.type);
      },
      {
        message: 'Only PDF, DOC, DOCX, and TXT files are allowed',
      }
    ),
  category: z
    .enum(['contract', 'legal', 'employment', 'rental', 'other'])
    .default('other'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

// Document update schema
export const documentUpdateSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must not exceed 255 characters')
    .optional(),
  category: z
    .enum(['contract', 'legal', 'employment', 'rental', 'other'])
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

export type DocumentUpdateFormData = z.infer<typeof documentUpdateSchema>;

// Document filter schema
export const documentFilterSchema = z.object({
  category: z
    .enum(['contract', 'legal', 'employment', 'rental', 'other', 'all'])
    .default('all'),
  search: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'filename', 'category', 'riskScore'])
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type DocumentFilterData = z.infer<typeof documentFilterSchema>;
