import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { LanguageProvider } from './LanguageProvider';
import { Toaster } from '@/app/components/ui/sonner';
import { ErrorBoundary } from '@/shared/components/error-boundary/ErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Centralized provider composition
 * All app-level providers are composed here in the correct order
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider defaultTheme="light">
          <LanguageProvider defaultLanguage="en">
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
