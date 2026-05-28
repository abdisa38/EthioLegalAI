import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delayMs = 300,
): T {
  const lastRunRef = useRef(Date.now());

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delayMs) {
        callback(...args);
        lastRunRef.current = now;
      }
    },
    [callback, delayMs],
  ) as T;
}
