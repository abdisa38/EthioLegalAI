import React from 'react';
import AIChatPage from '../../app/components/AIChatPage';
import { X } from 'lucide-react';

export default function ChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70 }}>
      <div style={{ width: 'min(980px,98%)', height: '86vh', borderRadius: 12, overflow: 'hidden', background: '#071026', boxShadow: '0 18px 60px rgba(2,6,23,0.7)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(8,11,24,0.85)' }}>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }} aria-label="Close chat modal"><X /></button>
        </div>
        <div style={{ flex: 1 }}>
          <AIChatPage />
        </div>
      </div>
    </div>
  );
}
