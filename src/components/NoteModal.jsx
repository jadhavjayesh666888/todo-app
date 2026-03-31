import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check } from 'lucide-react';

export default function NoteModal({ isOpen, onClose, onSave, initialData }) {
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialData) {
        setHeading(initialData.heading || '');
        setDescription(initialData.description || '');
        setColor(initialData.color || '');
      } else {
        setHeading('');
        setDescription('');
        setColor('');
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!heading.trim() && !description.trim()) return;
    
    const payload = { 
      heading, 
      description, 
      color,
      type: 'note'
    };
    
    if (initialData && initialData.id) {
      payload.id = initialData.id;
    }

    onSave(payload);
    onClose();
  };

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="glass animate-fade-in" style={{
        width: '95%', maxWidth: '500px',
        backgroundColor: 'var(--surface-card)',
        borderRadius: '1.5rem',
        border: 'var(--glass-border)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '85vh',
        color: 'var(--text-primary)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', opacity: 0.8 }}>{initialData ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '0 2rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <input
              type="text" value={heading} onChange={(e) => setHeading(e.target.value)}
              placeholder="Note Title"
              style={{
                width: '100%', fontSize: '2rem', fontWeight: 700,
                backgroundColor: 'transparent', color: 'var(--text-primary)',
                border: 'none', padding: 0, outline: 'none',
                letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif"
              }}
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your note here..."
            style={{
              width: '100%', flex: 1, minHeight: '200px',
              backgroundColor: 'transparent', color: 'var(--text-primary)',
              border: 'none', padding: 0, outline: 'none', resize: 'none',
              fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9,
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Note Color</div>
            <div className="swatch-container">
              {[
                { name: 'None', val: '' },
                { name: 'Indigo', val: '#818cf8' },
                { name: 'Emerald', val: '#10b981' },
                { name: 'Rose', val: '#f43f5e' },
                { name: 'Amber', val: '#f59e0b' },
                { name: 'Sky', val: '#0ea5e9' },
                { name: 'Violet', val: '#8b5cf6' }
              ].map((s) => (
                <div
                  key={s.val}
                  onClick={() => setColor(s.val)}
                  className={`color-swatch ${color === s.val ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: s.val || 'transparent',
                    border: s.val ? 'none' : '1.5px solid var(--text-disabled)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title={s.name}
                >
                  {color === s.val && <Check size={12} color={s.val ? "white" : "var(--text-disabled)"} strokeWidth={4} />}
                </div>
              ))}
              
              <div
                className={`color-swatch ${color && !['', '#818cf8', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6'].includes(color) ? 'active' : ''}`}
                style={{ 
                  backgroundColor: (color && !['', '#818cf8', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6'].includes(color)) ? color : 'transparent',
                  border: '1.5px solid var(--text-disabled)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden', flexShrink: 0
                }}
                title="Custom Color"
              >
                {! (color && !['', '#818cf8', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6'].includes(color)) && <Plus size={14} color="var(--text-disabled)" />}
                {color && !['', '#818cf8', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6'].includes(color) && <Check size={12} color="white" strokeWidth={4} />}
                <input 
                  type="color" 
                  value={color || '#818cf8'} 
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary" style={{
            backgroundColor: 'var(--accent-primary)',
            borderRadius: '9999px',
            padding: '1rem 2rem',
            color: 'white',
            border: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 10px 30px rgba(129, 140, 248, 0.4)'
          }}>
            {initialData ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
