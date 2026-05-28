import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "../components/ui/sonner";
import ErrorBoundary from "../../shared/components/ErrorBoundary";
import ThemeProvider from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";
import { createQueryClient } from "./queryClient";

const queryClient = createQueryClient();

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster richColors />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

