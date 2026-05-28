import { useCallback, useEffect, useState } from 'react';

type UseAsyncState<T, E = string> = {
  loading: boolean;
  data: T | null;
  error: E | null;
};

export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true,
) {
  const [state, setState] = useState<UseAsyncState<T, E>>({
    loading: immediate,
    data: null,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ loading: true, data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ loading: false, data: response, error: null });
      return response;
    } catch (error) {
      setState({
        loading: false,
        data: null,
        error: error instanceof Error ? (error.message as unknown as E) : (error as E),
      });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
