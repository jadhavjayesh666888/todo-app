import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Link, Globe, ChevronDown, Plus } from 'lucide-react';

export default function LinkModal({ isOpen, onClose, onSave, initialData, categories = [] }) {
  const [heading, setHeading] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setHeading(initialData.heading || '');
      setUrl(initialData.url || '');
      setCategory(initialData.category || 'Uncategorized');
    } else {
      setHeading('');
      setUrl('');
      setCategory('Uncategorized');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!heading.trim() || !url.trim()) return;
    
    // Simple URL validation/prefixing
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    
    onSave({
      heading: heading.trim(),
      url: finalUrl,
      category,
      id: initialData?.id
    });
  };

  const colors = [
    { name: 'None', value: '' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Sky', value: '#0ea5e9' },
  ];

  return createPortal(
    <div className="modal-backdrop" style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="glass modal-content" style={{
        width: '100%', maxWidth: '500px',
        backgroundColor: 'var(--surface-card)', borderRadius: '1.5rem',
        border: 'var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border-color)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {initialData ? 'Edit Link' : 'New Link'}
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)',
            width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link Title</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Link size={18} />
              </div>
              <input
                type="text" 
                value={heading} 
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. My Portfolio"
                autoFocus
                className="input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Globe size={18} />
              </div>
              <input
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', fontSize: '0.95rem', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s'
                }}
              >
                <span>{categories.find(c => c.id === category)?.name || category}</span>
                <ChevronDown size={18} style={{ color: 'var(--text-disabled)', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              
              {isDropdownOpen && (
                <div className="glass animate-pop" style={{
                  position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '0.5rem',
                  backgroundColor: 'var(--surface-card)', borderRadius: '1rem', border: '1px solid var(--border-color)',
                  boxShadow: '0 -10px 30px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden', padding: '0.5rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem', transformOrigin: 'bottom'
                }}>
                  <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingRight: '0.25rem' }}>
                    <div 
                      onClick={() => { setCategory('Uncategorized'); setIsDropdownOpen(false); }}
                      style={{ padding: '0.7rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', backgroundColor: category === 'Uncategorized' ? 'rgba(255,255,255,0.05)' : 'transparent', color: category === 'Uncategorized' ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: category === 'Uncategorized' ? 700 : 400 }}
                    >
                      Uncategorized
                    </div>
                    {categories.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => { setCategory(c.id); setIsDropdownOpen(false); }}
                        style={{ padding: '0.7rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', backgroundColor: category === c.id ? 'rgba(255,255,255,0.05)' : 'transparent', color: category === c.id ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: category === c.id ? 700 : 400 }}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '1rem', borderRadius: '1rem', border: 'none',
              backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem'
            }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}>
              Cancel
            </button>
            <button type="submit" disabled={!heading.trim() || !url.trim()} style={{
              flex: 1, padding: '1rem', borderRadius: '1rem', border: 'none',
              backgroundColor: 'var(--accent-primary)', color: 'white',
              fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
              opacity: (!heading.trim() || !url.trim()) ? 0.5 : 1,
              boxShadow: '0 8px 20px rgba(129, 140, 248, 0.4)',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              {initialData ? 'Save Changes' : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
