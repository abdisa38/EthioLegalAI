import { createContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

export type Language = 'en' | 'am' | 'or';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// Simple translations object (can be expanded or moved to separate files)
const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'EthioLegal AI',
    'app.tagline': 'Your AI-Powered Legal Assistant',
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'AI Chat',
    'nav.upload': 'Upload Document',
    'nav.documents': 'My Documents',
    'nav.history': 'Chat History',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'auth.login': 'Sign In',
    'auth.register': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  am: {
    'app.title': 'ኢትዮ ሊጋል AI',
    'app.tagline': 'የእርስዎ AI-ተኮር የህግ ረዳት',
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.chat': 'AI ውይይት',
    'nav.upload': 'ሰነድ ይስቀሉ',
    'nav.documents': 'የእኔ ሰነዶች',
    'nav.history': 'የውይይት ታሪክ',
    'nav.settings': 'ቅንብሮች',
    'nav.logout': 'ውጣ',
    'auth.login': 'ግባ',
    'auth.register': 'ተመዝገብ',
    'auth.email': 'ኢሜይል',
    'auth.password': 'የይለፍ ቃል',
    'auth.name': 'ሙሉ ስም',
    'common.loading': 'በመጫን ላይ...',
    'common.error': 'ስህተት',
    'common.success': 'ተሳክቷል',
    'common.cancel': 'ሰርዝ',
    'common.save': 'አስቀምጥ',
    'common.delete': 'ሰርዝ',
    'common.edit': 'አርትዕ',
  },
  or: {
    'app.title': 'EthioLegal AI',
    'app.tagline': 'Gargaaraa Seeraa AI Keessan',
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'Haasawa AI',
    'nav.upload': 'Galmee Olkaa\'i',
    'nav.documents': 'Galmeewwan Koo',
    'nav.history': 'Seenaa Haasawaa',
    'nav.settings': 'Qindaa\'ina',
    'nav.logout': 'Ba\'i',
    'auth.login': 'Seeni',
    'auth.register': 'Galmaa\'i',
    'auth.email': 'Email',
    'auth.password': 'Jecha Icciitii',
    'auth.name': 'Maqaa Guutuu',
    'common.loading': 'Fe\'aa jira...',
    'common.error': 'Dogoggora',
    'common.success': 'Milkaa\'ina',
    'common.cancel': 'Haqii',
    'common.save': 'Olkaa\'i',
    'common.delete': 'Haqii',
    'common.edit': 'Gulaali',
  },
};

export const LanguageProvider = ({
  children,
  defaultLanguage = 'en',
}: LanguageProviderProps) => {
  const [language, setLanguage] = useLocalStorage<Language>(
    'ethiolegal-language',
    defaultLanguage
  );

  // Translation function
  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
