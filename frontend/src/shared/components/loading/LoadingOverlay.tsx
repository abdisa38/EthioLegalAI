import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  text?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay = ({
  text = 'Loading...',
  fullScreen = false,
}: LoadingOverlayProps) => {
  return (
    <div
      style={{
        position: fullScreen ? 'fixed' : 'absolute',
        inset: 0,
        background: 'rgba(15,23,42,0.04)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '32px 48px',
          textAlign: 'center',
        }}
      >
        <LoadingSpinner size={40} text={text} />
      </div>
    </div>
  );
};
