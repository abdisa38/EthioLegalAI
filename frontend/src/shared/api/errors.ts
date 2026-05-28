import type { AxiosError } from "axios";

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

type ApiErrorPayload = {
  message?: string;
  error?: string;
  details?: unknown;
};

const isAxiosError = (error: unknown): error is AxiosError =>
  Boolean(error) &&
  typeof error === "object" &&
  "isAxiosError" in error &&
  Boolean((error as { isAxiosError?: unknown }).isAxiosError);

export function toApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    if (error instanceof Error) return { message: error.message };
    return { message: "Something went wrong. Please try again." };
  }

  const status = error.response?.status;
  const payload = error.response?.data as ApiErrorPayload | undefined;

  const message =
    payload?.message ||
    payload?.error ||
    error.message ||
    "Request failed. Please try again.";

  return {
    message,
    status,
    code: error.code,
    details: payload?.details,
  };
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}

