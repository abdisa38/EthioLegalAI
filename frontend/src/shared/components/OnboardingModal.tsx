import React from 'react';

const SUGGESTED = [
  'Can a landlord evict me without notice?',
  'What are my overtime pay rights?',
  'How do I spot risky contract clauses?',
];

export default function OnboardingModal({ open, onClose, onChoose }: { open: boolean; onClose: () => void; onChoose: (t: string) => void }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 65 }}>
      <div style={{ width: 'min(720px,92%)', borderRadius: 12, padding: 18, background: 'linear-gradient(180deg,#061026, #07122a)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <h2 style={{ margin: 0, color: '#e6eef8' }}>Welcome to EthioLegal AI</h2>
        <p style={{ color: '#8ea0b6' }}>Quick start: ask a question or pick a suggested prompt.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => onChoose(s)} style={{ padding: '8px 12px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.16)', color: '#cbd5e1', cursor: 'pointer' }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>Close</button>
        </div>
      </div>
    </div>
  );
}
