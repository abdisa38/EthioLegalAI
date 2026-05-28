import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  languagePreference: z.enum(['en', 'am', 'om']).default('en'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Profile Schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  languagePreference: z.enum(['en', 'am', 'om']),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Chat Schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
  conversationId: z.string().optional(),
});

// Document Schemas
export const documentUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'File must be less than 10MB',
  ).refine(
    (file) => ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
    'File must be PDF, TXT, or DOCX',
  ),
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  category: z.enum(['contract', 'agreement', 'legal_document', 'other']),
  description: z.string().max(1000, 'Description is too long').optional(),
});

// Contract Analysis Schemas
export const contractAnalysisSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  analysisType: z.enum(['summary', 'risks', 'obligations', 'full']).default('full'),
});

// Search Schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(1000),
  filters: z.object({
    documentType: z.enum(['contract', 'agreement', 'legal_document', 'other']).optional(),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
  }).optional(),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
  }).optional(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
export type ContractAnalysisFormData = z.infer<typeof contractAnalysisSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
