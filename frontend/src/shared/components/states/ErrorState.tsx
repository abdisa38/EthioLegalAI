import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '2px solid rgba(239,68,68,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <AlertTriangle size={36} color="#ef4444" />
      </div>

      <h3
        style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: '#475569',
          fontSize: '15px',
          lineHeight: '1.6',
          maxWidth: '400px',
          marginBottom: onRetry ? '24px' : '0',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(37,99,235,0.1)',
            border: '1px solid rgba(37,99,235,0.2)',
            color: '#2563eb',
            padding: '12px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
          }}
          className="hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={18} />
          {retryLabel}
        </button>
      )}
    </div>
  );
};
