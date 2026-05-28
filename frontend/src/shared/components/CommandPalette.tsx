import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

const COMMANDS = [
  { id: 'new', label: 'New Chat' },
  { id: 'history', label: 'Open History' },
  { id: 'onboarding', label: 'Show Onboarding' },
];

export default function CommandPalette({ open, onClose, onRun }: { open: boolean; onClose: () => void; onRun: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => { if (open) { setQuery(''); setTimeout(() => ref.current?.focus(), 50); } }, [open]);

  if (!open) return null;

  const results = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, zIndex: 70 }}>
      <div style={{ width: 'min(720px,92%)', background: 'rgba(7,10,20,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, boxShadow: '0 12px 40px rgba(2,6,23,0.6)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Search size={16} color="#64748b" />
          <input ref={ref} value={query} onChange={e => setQuery(e.target.value)} placeholder="Type a command or search..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 15 }} />
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>Esc</button>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          {results.map(r => (
            <button key={r.id} onClick={() => onRun(r.id)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1', cursor: 'pointer' }}>{r.label}</button>
          ))}
          {results.length === 0 && <div style={{ color: '#64748b', padding: 12 }}>No commands match.</div>}
        </div>
      </div>
    </div>
  );
}
