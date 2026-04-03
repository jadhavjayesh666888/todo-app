import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil, Trash2, Calendar, Clock, FileText, Check, ListTodo, Star, Pin } from 'lucide-react';

export default function PreviewModal({ isOpen, onClose, item, onEdit, onDelete }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isNote = item.type === 'note';
  const formatDate = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="glass animate-fade-in" style={{
        width: '95%', maxWidth: '600px',
        backgroundColor: 'var(--surface-card)',
        borderRadius: '2rem',
        border: 'var(--glass-border)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '85vh',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8)'
      }}>
        {/* Top Header Actions */}
        <div style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
             {item.pinned && <Pin size={16} fill="var(--accent-primary)" color="var(--accent-primary)" />}
             {item.starred && <Star size={16} fill="#FFC107" color="#FFC107" />}
             <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                {isNote ? 'Note Preview' : 'ToDo Preview'}
             </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={() => { onEdit(item); onClose(); }} className="btn-ghost active-press" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(129,140,248,0.1)', border: 'none', cursor: 'pointer' }}>
              <Pencil size={14} />
              Edit
            </button>
            <button onClick={onClose} className="btn-ghost active-press" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-secondary)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              marginTop: '0.4rem', 
              color: item.color || 'var(--text-secondary)', 
              opacity: 0.6 
            }}>
              {isNote ? <FileText size={28} /> : <ListTodo size={28} />}
            </div>
            <h2 style={{ 
              margin: 0, fontSize: '2.5rem', fontWeight: 800, 
              lineHeight: 1.1, letterSpacing: '-0.04em', 
              fontFamily: "'Space Grotesk', sans-serif" 
            }}>
              {item.heading}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} />
                  <span>{formatDate(item.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Clock size={14} />
                  <span>{isNote ? 'Static Note' : `${item.items?.length || 0} Tasks`}</span>
              </div>
          </div>

          <div style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--text-primary)', opacity: 0.9 }}>
            {isNote ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {item.items?.map((task, idx) => (
                   <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ 
                        marginTop: '0.2rem', width: '18px', height: '18px', borderRadius: '50%',
                        border: task.done ? 'none' : '2px solid var(--accent-primary)',
                        backgroundColor: task.done ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {task.done && <Check color="white" size={11} strokeWidth={4} />}
                      </div>
                      <span style={{ 
                        textDecoration: task.done ? 'line-through' : 'none',
                        opacity: task.done ? 0.5 : 1
                      }}>
                        {task.text}
                      </span>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
