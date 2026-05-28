import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function FloatingAssistant({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      aria-label="Open assistant"
      onClick={onOpen}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 14,
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 60,
      }}
    >
      <PlusCircle size={22} color="white" />
    </button>
  );
}
