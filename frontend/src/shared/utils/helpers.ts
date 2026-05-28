/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create abort signal with timeout
 */
export function createTimeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  
  const signal = controller.signal;
  const originalRemove = signal.removeEventListener;
  
  signal.removeEventListener = function(
    ...args: Parameters<AbortSignal['removeEventListener']>
  ) {
    clearTimeout(timeoutId);
    return originalRemove.apply(signal, args);
  };
  
  return signal;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value is mobile user agent
 */
export function isMobileUserAgent(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options = { maxAttempts: 3, delayMs: 1000 },
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < options.maxAttempts) {
        const waitTime = options.delayMs * Math.pow(2, attempt - 1);
        await delay(waitTime);
      }
    }
  }
  
  throw lastError;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallTime >= delayMs) {
      fn(...args);
      lastCallTime = now;
    }
  };
}

/**
 * Memoize function result
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
