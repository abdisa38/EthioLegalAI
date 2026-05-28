import { z } from 'zod';

// Chat message schema
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message must not exceed 5000 characters'),
  language: z
    .enum(['en', 'am', 'or'])
    .default('en'),
  category: z
    .enum(['general', 'contract', 'tenant', 'labor', 'other'])
    .default('general')
    .optional(),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;

// Chat creation schema
export const createChatSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  category: z
    .enum(['general', 'contract', 'tenant', 'labor', 'other'])
    .default('general'),
  language: z
    .enum(['en', 'am', 'or'])
    .default('en'),
});

export type CreateChatFormData = z.infer<typeof createChatSchema>;

// Chat update schema
export const updateChatSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  starred: z.boolean().optional(),
});

export type UpdateChatFormData = z.infer<typeof updateChatSchema>;

// Chat rating schema
export const chatRatingSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5'),
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional(),
});

export type ChatRatingFormData = z.infer<typeof chatRatingSchema>;

// Chat filter schema
export const chatFilterSchema = z.object({
  category: z
    .enum(['general', 'contract', 'tenant', 'labor', 'other', 'all'])
    .default('all'),
  starred: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title'])
    .default('updatedAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type ChatFilterData = z.infer<typeof chatFilterSchema>;
