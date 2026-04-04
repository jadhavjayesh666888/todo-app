import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, ChevronDown, ChevronRight, ListTodo, Tag, Folder } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function TodoModal({ isOpen, onClose, onSave, initialData, categories = [] }) {
  const [heading, setHeading] = useState('');
  const [items, setItems] = useState([{ text: '', done: false }]);
  const [color, setColor] = useState(''); // Default to empty string (Theme matched)
  const [showTicked, setShowTicked] = useState(false);
  const [category, setCategory] = useState('Uncategorized');
  const [subCategory, setSubCategory] = useState('');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialData) {
        setHeading(initialData.heading || '');
        setItems(initialData.items && initialData.items.length > 0 ? initialData.items : [{ text: '', done: false }]);
        setColor(initialData.color || '');
        setCategory(initialData.category || 'Uncategorized');
        setSubCategory(initialData.subCategory || '');
      } else {
        setHeading('');
        setItems([{ text: '', done: false }]);
        setColor('');
        setCategory('Uncategorized');
        setSubCategory('');
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddItem = () => setItems([...items, { text: '', done: false }]);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index].text = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSave = () => {
    if (!heading.trim() || items.every(i => !i.text.trim())) return;
    const validItems = items.filter(i => i.text.trim() !== '');

    const payload = { heading, items: validItems, color, category, subCategory };
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
        overflow: 'hidden' // Root container doesn't scroll
      }}>
        {/* Header - Fixed */}
        <div style={{ padding: '1.5rem 2rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-card)', border: 'none' }}>
          <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', opacity: 0.8 }}>{initialData ? 'Edit Todo' : 'New Todo'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0.25 }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ padding: '0 2rem 1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              marginTop: '0.6rem', 
              color: 'var(--accent-primary)', 
              opacity: 0.6 
            }}>
              <ListTodo size={28} />
            </div>
            <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <input
                type="text" value={heading} onChange={(e) => setHeading(e.target.value)}
                placeholder="Todo Title"
                style={{
                  width: '100%', fontSize: '2rem', fontWeight: 700,
                  backgroundColor: 'transparent', color: 'var(--text-primary)',
                  border: 'none', padding: 0, outline: 'none', boxShadow: 'none',
                  letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif"
                }}
              />
            </div>
          </div>

          {/* Collection & Sub-category Selection */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Collection</label>
              <div 
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                style={{ 
                  padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', 
                  backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {(() => {
                    const cat = categories.find(c => c.id === category);
                    if (cat) {
                      const Icon = LucideIcons[cat.icon] || Folder;
                      return <Icon size={14} color={cat.color} />;
                    }
                    return <Tag size={14} color="var(--text-disabled)" />;
                  })()}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {categories.find(c => c.id === category)?.name || 'Uncategorized'}
                  </span>
                </div>
                <ChevronDown size={16} />
              </div>

              {isCatDropdownOpen && (
                <div style={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', 
                  backgroundColor: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--border-color)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 100, maxHeight: '200px', overflowY: 'auto'
                }}>
                  <div 
                    onClick={() => { setCategory('Uncategorized'); setIsCatDropdownOpen(false); }}
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', color: category === 'Uncategorized' ? 'var(--accent-primary)' : 'inherit' }}
                  >
                    Uncategorized
                  </div>
                  {categories.map(cat => (
                    <div 
                      key={cat.id}
                      onClick={() => { setCategory(cat.id); setIsCatDropdownOpen(false); }}
                      style={{ 
                        padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: category === cat.id ? 'var(--accent-primary)' : 'inherit'
                      }}
                    >
                      {(() => {
                        const Icon = LucideIcons[cat.icon] || Folder;
                        return <Icon size={14} color={cat.color} />;
                      })()}
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Sub-category (e.g. Treasure Hunting)</label>
              <input 
                type="text" 
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="None"
                style={{ 
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', 
                  backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Active Items */}
            {items.map((item, idx) => {
              if (item.done) return null;
              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
                  <div
                    onClick={() => {
                      const newItems = [...items];
                      newItems[idx].done = !newItems[idx].done;
                      setItems(newItems);
                    }}
                    style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: item.done ? 'none' : `2px solid var(--accent-primary)`,
                      backgroundColor: item.done ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      flexShrink: 0
                    }}
                  >
                    {item.done && <Check size={11} color="white" strokeWidth={4} />}
                  </div>
                  <input
                    type="text" value={item.text}
                    onChange={(e) => handleItemChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    autoFocus={idx === items.length - 1 && items.length > 1 && item.text === ''}
                    placeholder={`Todo ${idx + 1}`}
                    style={{
                      flex: 1, backgroundColor: 'transparent', color: 'var(--text-primary)',
                      border: 'none', padding: 0, outline: 'none', boxShadow: 'none',
                      fontSize: '1.1rem', fontWeight: 500,
                      textDecoration: item.done ? 'line-through' : 'none',
                      opacity: item.done ? 0.3 : 1
                    }}
                  />
                  <button onClick={() => handleRemoveItem(idx)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', opacity: 0.2 }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            {/* Persistent Add Item Button */}
            <button
              onClick={handleAddItem}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                marginTop: '0.5rem', cursor: 'pointer',
                color: 'var(--text-secondary)', opacity: 0.6,
                background: 'none', border: 'none', padding: '0.5rem 0',
                fontSize: '0.9rem', fontWeight: 500, transition: 'opacity 0.2s'
              }}
              className="btn-ghost-no-border"
            >
              <Plus size={16} />
              Add todo
            </button>

            {/* Ticked Section Toggle */}
            {items.some(i => i.done) && (
              <div
                onClick={() => setShowTicked(!showTicked)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  marginTop: '1rem', cursor: 'pointer',
                  color: 'var(--accent-primary)', opacity: 0.8,
                  fontSize: '0.75rem', fontWeight: 900, textTransform: 'none', letterSpacing: '0.12em'
                }}
              >
                {showTicked ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                + {items.filter(i => i.done).length} ticked ToDos
              </div>
            )}

            {/* Ticked Items (Collapsible) */}
            {showTicked && items.map((item, idx) => {
              if (!item.done) return null;
              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
                  <div
                    onClick={() => {
                      const newItems = [...items];
                      newItems[idx].done = !newItems[idx].done;
                      setItems(newItems);
                    }}
                    style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: item.done ? 'none' : `2px solid var(--accent-primary)`,
                      backgroundColor: item.done ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      flexShrink: 0
                    }}
                  >
                    {item.done && <Check size={11} color="white" strokeWidth={4} />}
                  </div>
                  <input
                    type="text" value={item.text}
                    onChange={(e) => handleItemChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    placeholder={`Todo ${idx + 1}`}
                    style={{
                      flex: 1, backgroundColor: 'transparent', color: 'var(--text-primary)',
                      border: 'none', padding: 0, outline: 'none', boxShadow: 'none',
                      fontSize: '1.1rem', fontWeight: 500,
                      textDecoration: item.done ? 'line-through' : 'none',
                      opacity: item.done ? 0.3 : 1
                    }}
                  />
                  <button onClick={() => handleRemoveItem(idx)} className="btn-ghost" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', opacity: 0.2 }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div style={{ padding: '1.5rem 2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-card)', border: 'none', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pinboard Color</div>
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
              
              {/* Custom Color Picker Swatch */}
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
            border: 'none',
            boxShadow: '0 10px 30px rgba(129, 140, 248, 0.4)',
            padding: '1rem 2rem',
            color: 'white',
            flexShrink: 0,
            fontSize: '0.9rem'
          }}>
            {initialData ? 'Update Todo' : 'Save Todo'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
