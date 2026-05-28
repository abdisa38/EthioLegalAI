import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "../components/ui/sonner";
import ErrorBoundary from "../../shared/components/ErrorBoundary";
import ThemeProvider from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";
import { MobileSidebarProvider } from "../context/MobileSidebarContext";
import { createQueryClient } from "./queryClient";
import { useEffect, useState } from 'react';
import FloatingAssistant from '../../shared/components/FloatingAssistant';
import CommandPalette from '../../shared/components/CommandPalette';
import OnboardingModal from '../../shared/components/OnboardingModal';
import ChatModal from '../../shared/components/ChatModal';

const queryClient = createQueryClient();

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      // Cmd/Ctrl+K: open palette
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o); }
      // Ctrl+Shift+A or Cmd+Shift+A: toggle assistant
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') { e.preventDefault(); setChatOpen(c => !c); }
      if (e.key === 'Escape') { setPaletteOpen(false); setChatOpen(false); setOnboardingOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <MobileSidebarProvider>
                {children}
                <Toaster richColors position="top-right" />
                <FloatingAssistant onOpen={() => setChatOpen(true)} />
                <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onRun={(id) => {
                  if (id === 'new') setChatOpen(true);
                  if (id === 'onboarding') setOnboardingOpen(true);
                  setPaletteOpen(false);
                }} />
                <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} onChoose={(t) => {
                  // Open chat and emit an event with the preset text
                  setChatOpen(true);
                  setOnboardingOpen(false);
                  setTimeout(() => window.dispatchEvent(new CustomEvent('assistant-send-preset', { detail: { text: t } })), 200);
                }} />
                <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
              </MobileSidebarProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

