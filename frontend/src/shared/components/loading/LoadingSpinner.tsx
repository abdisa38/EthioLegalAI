import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({
  size = 24,
  className = '',
  text,
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <Loader2
        size={size}
        className="animate-spin text-blue-500"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      {text && (
        <p className="text-sm text-slate-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};
