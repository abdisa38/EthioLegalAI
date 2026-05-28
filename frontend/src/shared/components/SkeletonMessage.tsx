import React from 'react';

export default function SkeletonMessage({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(90deg,#0b1220,#0e1726)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)' }} />
      <div style={{ flex: 1 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ height: 10, background: 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))', borderRadius: 6, marginBottom: 8, width: `${90 - i * 10}%`, animation: 'pulse 1.2s infinite' }} />
        ))}
      </div>
    </div>
  );
}
