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
        background: 'rgba(8, 11, 24, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
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
