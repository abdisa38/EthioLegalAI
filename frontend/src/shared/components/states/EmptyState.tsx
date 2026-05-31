import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children?: ReactNode;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) => {
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
          background: 'rgba(37,99,235,0.1)',
          border: '2px solid rgba(37,99,235,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <Icon size={36} color="#2563eb" />
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
          marginBottom: action || children ? '24px' : '0',
        }}
      >
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(37,99,235,0.1)',
            color: '#2563eb',
            border: '1px solid rgba(37,99,235,0.2)',
            padding: '12px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
          }}
        >
          {action.icon && <action.icon size={18} />}
          {action.label}
        </button>
      )}

      {children}
    </div>
  );
};
