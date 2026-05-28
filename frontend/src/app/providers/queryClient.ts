import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "../../shared/api/errors";

type QueryMeta = {
  toastOnError?: boolean;
};

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const meta = (query.meta || {}) as QueryMeta;
        if (meta.toastOnError) toast.error(getErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const meta = (mutation.meta || {}) as QueryMeta;
        if (meta.toastOnError) toast.error(getErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const message = getErrorMessage(error).toLowerCase();
          if (
            message.includes("unauthorized") ||
            message.includes("forbidden")
          ) {
            return false;
          }
          return failureCount < 2;
        },
        staleTime: 30_000,
        gcTime: 10 * 60_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

