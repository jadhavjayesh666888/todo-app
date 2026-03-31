import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, gap: '1.5rem', transition: 'opacity 0.3s ease'
    }}>
      <div className="pulse-logo" style={{
        backgroundColor: 'var(--accent-primary)', color: 'white',
        width: '64px', height: '64px', borderRadius: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(129, 140, 248, 0.4)'
      }}>
        <CheckCircle2 size={40} strokeWidth={2.5} />
      </div>
      <div style={{ 
        fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', 
        textTransform: 'uppercase', letterSpacing: '0.15em' 
      }}>
        {message}
      </div>
    </div>
  );
}
