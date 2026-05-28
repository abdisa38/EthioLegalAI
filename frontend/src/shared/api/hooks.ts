import { useNavigate } from 'react-router';
import { useCallback } from 'react';

/**
 * Hook for safe navigation with error handling
 */
export function useSafeNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (to: string | number, options?: any) => {
      try {
        if (typeof to === 'number') {
          navigate(to);
        } else {
          navigate(to, options);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    },
    [navigate],
  );
}

/**
 * Hook to detect network status changes
 */
export function useOnline() {
  const [isOnline, setIsOnline] = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  useCallback(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, [setIsOnline]);

  return navigator.onLine;
}

/**
 * Hook for handling request cancellation
 */
export function useCancelableRequest() {
  const controllerRef = useCallback(() => {
    return new AbortController();
  }, []);

  const cancel = useCallback((controller: AbortController) => {
    controller.abort();
  }, []);

  return { controllerRef, cancel };
}
