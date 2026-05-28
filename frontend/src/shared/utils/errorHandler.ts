import { toast } from 'sonner';
import type { ApiError } from '../api/errors';

export function handleApiError(error: unknown, defaultMessage?: string) {
  const message = defaultMessage || 'An error occurred. Please try again.';
  
  if (error instanceof Error) {
    toast.error(error.message);
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    const apiError = error as ApiError;
    toast.error(apiError.message || message);
  } else {
    toast.error(message);
  }
}

export function handleSuccess(message = 'Success!') {
  toast.success(message);
}

export function handlePromise<T>(
  promise: Promise<T>,
  {
    loading = 'Loading...',
    success = 'Success!',
    error = 'An error occurred',
  }: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((err: unknown) => string);
  } = {},
) {
  const id = toast.loading(loading);

  return promise
    .then((data) => {
      const message = typeof success === 'function' ? success(data) : success;
      toast.success(message, { id });
      return data;
    })
    .catch((err) => {
      const message = typeof error === 'function' ? error(err) : error;
      toast.error(message, { id });
      throw err;
    });
}
