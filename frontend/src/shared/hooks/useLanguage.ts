import { useContext } from 'react';
import { LanguageContext } from '@/app/providers/LanguageProvider';

/**
 * Custom hook to access language context
 * Must be used within LanguageProvider
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  
  return context;
};
