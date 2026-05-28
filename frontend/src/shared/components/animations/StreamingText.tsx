import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

/**
 * Streaming text component for AI responses
 * Shows cursor while streaming, smooth appearance
 */
export const StreamingText = ({
  text,
  isStreaming,
  className = '',
}: StreamingTextProps) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {displayText}
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1 h-4 bg-indigo-500 ml-1 align-middle"
          />
        )}
      </motion.div>
    </div>
  );
};
