import { QueryClient } from '@tanstack/react-query';
import { http } from './http';

/**
 * Create a prefetch query utility for server-side data fetching
 */
export async function prefetchQuery<TData>(
  queryClient: QueryClient,
  queryKey: string[],
  queryFn: () => Promise<TData>,
) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

/**
 * Invalidate related queries
 */
export function invalidateQueries(
  queryClient: QueryClient,
  pattern: string | string[],
) {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  patterns.forEach((p) => {
    queryClient.invalidateQueries({
      queryKey: [p],
    });
  });
}

/**
 * Batch multiple API calls
 */
export async function batchRequests<T extends readonly Promise<any>[]>(
  requests: T,
): Promise<Awaited<T[number]>[]> {
  return Promise.all(requests);
}

/**
 * Stream response handler (useful for streaming APIs)
 */
export async function streamResponse(
  url: string,
  onChunk: (chunk: string) => void,
  options?: { signal?: AbortSignal },
) {
  const response = await fetch(`${http.defaults.baseURL}${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('ethiolegal_token')}`,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is not readable');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          onChunk(line);
        }
      }
    }

    if (buffer.trim()) {
      onChunk(buffer);
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Retry request with exponential backoff
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    delayMs = 1000,
    backoff = 2,
    shouldRetry = (error) => error.response?.status !== 401,
  }: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: number;
    shouldRetry?: (error: any) => boolean;
  } = {},
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === maxRetries - 1) {
        throw error;
      }

      const waitTime = delayMs * Math.pow(backoff, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}
