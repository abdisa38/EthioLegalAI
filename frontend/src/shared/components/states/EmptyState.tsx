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
          color: '#f1f5f9',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: '#64748b',
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
            background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 0 20px rgba(37,99,235,0.25)',
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
