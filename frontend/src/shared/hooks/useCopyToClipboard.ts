import { useState } from 'react';

/**
 * Custom hook to copy text to clipboard
 */
export function useCopyToClipboard(): [
  boolean,
  (text: string) => Promise<void>
] {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.warn('Copy failed', error);
      setIsCopied(false);
    }
  };

  return [isCopied, copyToClipboard];
}
