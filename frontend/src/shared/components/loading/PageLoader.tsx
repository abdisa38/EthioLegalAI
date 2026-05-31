import { Scale } from 'lucide-react';
import { motion } from 'motion/react';

interface PageLoaderProps {
  text?: string;
}

export const PageLoader = ({ text = 'Loading...' }: PageLoaderProps) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          textAlign: 'center',
        }}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(37,99,235,0.35)',
          }}
        >
          <Scale size={32} color="white" />
        </motion.div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          EthioLegal <span style={{ color: 'var(--primary)' }}>AI</span>
        </h2>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '14px',
          }}
        >
          {text}
        </motion.p>
      </motion.div>
    </div>
  );
};
