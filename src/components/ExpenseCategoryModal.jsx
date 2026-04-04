import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Tag, Save, ChevronRight, Pencil, Check } from 'lucide-react';

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e'];

export default function ExpenseCategoryModal({ isOpen, onClose, categories, onSave }) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  
  const [expandedCat, setExpandedCat] = useState(null);
  const [newSubName, setNewSubName] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Sync with prop when modal opens or categories update
  React.useEffect(() => {
    if (isOpen) {
      setLocalCategories(categories);
    }
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: Date.now().toString(),
      name: newCatName,
      color: newCatColor,
      subCategories: []
    };
    setLocalCategories([...localCategories, newCat]);
    setNewCatName('');
  };

  const removeCategory = (id) => {
    if (window.confirm('Delete this category and all its subcategories?')) {
      setLocalCategories(localCategories.filter(c => c.id !== id));
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const saveEditing = () => {
    if (!editingName.trim()) return;
    setLocalCategories(localCategories.map(c => 
      c.id === editingId ? { ...c, name: editingName.trim() } : c
    ));
    setEditingId(null);
  };

  const addSubCategory = (catId) => {
    if (!newSubName.trim()) return;
    setLocalCategories(localCategories.map(c => {
      if (c.id === catId) {
        return { ...c, subCategories: [...(c.subCategories || []), newSubName.trim()] };
      }
      return c;
    }));
    setNewSubName('');
  };

  const removeSubCategory = (catId, subName) => {
    setLocalCategories(localCategories.map(c => {
      if (c.id === catId) {
        return { ...c, subCategories: c.subCategories.filter(s => s !== subName) };
      }
      return c;
    }));
  };

  const handleSave = () => {
    onSave(localCategories);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="glass modal-content animate-pop" style={{ maxWidth: '600px', width: '95%', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Manage Categories</h2>
          <button onClick={onClose} className="icon-btn" style={{ padding: '0.75rem' }}><X size={24} /></button>
        </div>

        {/* Add New Category Section */}
        <div className="glass card-p" style={{ marginBottom: '3rem', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <label className="input-label" style={{ marginBottom: '1rem', display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>New Category</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              className="input" 
              style={{ flex: 1, height: '52px' }}
              placeholder="e.g., Food, Travel..." 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addCategory()}
            />
            <button onClick={addCategory} className="btn btn-primary" style={{ height: '52px', width: '52px', padding: 0, borderRadius: '14px' }}>
              <Plus size={24} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            {PRESET_COLORS.map(color => (
              <button 
                key={color}
                onClick={() => setNewCatColor(color)}
                style={{ 
                  width: '38px', height: '24px', borderRadius: '12px', background: color, 
                  border: newCatColor === color ? '3px solid white' : '2px solid transparent', 
                  cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: newCatColor === color ? `0 0 15px ${color}` : 'none',
                  transform: newCatColor === color ? 'scale(1.1)' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <label className="input-label" style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>Existing Categories</label>
          {localCategories.map(cat => (
            <div key={cat.id} className="glass" style={{ padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Oval Color Indicator */}
                <div style={{ width: '28px', height: '16px', borderRadius: '8px', background: cat.color, flexShrink: 0 }} />
                
                {editingId === cat.id ? (
                  <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                    <input 
                      autoFocus
                      className="input" 
                      style={{ height: '36px', fontSize: '0.9rem', padding: '0 0.75rem' }}
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && saveEditing()}
                    />
                    <button onClick={saveEditing} className="icon-btn" style={{ color: 'var(--accent-primary)', opacity: 1 }}><Check size={18} /></button>
                  </div>
                ) : (
                  <span style={{ fontWeight: 700, flex: 1, fontSize: '1rem' }}>{cat.name}</span>
                )}

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button 
                    onClick={() => startEditing(cat)}
                    className="icon-btn"
                    style={{ opacity: editingId === cat.id ? 0 : 0.5 }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className="icon-btn"
                    style={{ opacity: 1, color: expandedCat === cat.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                  >
                    <ChevronRight size={20} style={{ transform: expandedCat === cat.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }} />
                  </button>
                  <button onClick={() => removeCategory(cat.id)} className="icon-btn danger"><Trash2 size={16} /></button>
                </div>
              </div>

              {expandedCat === cat.id && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '1rem' }}>
                  <label className="input-label" style={{ fontSize: '0.7rem', marginBottom: '0.75rem', display: 'block' }}>Sub-Categories</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <input 
                      type="text" 
                      className="input" 
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', height: '40px' }}
                      placeholder="Add sub-category..." 
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addSubCategory(cat.id)}
                    />
                    <button onClick={() => addSubCategory(cat.id)} className="btn btn-primary" style={{ padding: '0 1rem', height: '40px' }}><Plus size={18} /></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {cat.subCategories?.map((sub, idx) => (
                      <div key={idx} className="glass" style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', 
                        padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <span>{sub}</span>
                        <button onClick={() => removeSubCategory(cat.id, sub)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-secondary)', display: 'flex' }}><X size={14} /></button>
                      </div>
                    ))}
                    {(!cat.subCategories || cat.subCategories.length === 0) && <div style={{ fontSize: '0.75rem', opacity: 0.5, padding: '0.5rem' }}>No sub-categories yet</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {localCategories.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5, fontStyle: 'italic' }}>No categories created yet.</div>}
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1.25rem' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, height: '52px' }}>Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Save size={20} /> Finish
          </button>
        </div>
      </div>

      <style>{`
        .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes pop { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .icon-btn:active { transform: scale(0.9); }
        .btn:active { transform: scale(0.97); }
      `}</style>
    </div>, document.body
  );
}
