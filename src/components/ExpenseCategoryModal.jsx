import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Tag, Save, ChevronRight } from 'lucide-react';

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e'];

export default function ExpenseCategoryModal({ isOpen, onClose, categories, onSave }) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  
  const [expandedCat, setExpandedCat] = useState(null);
  const [newSubName, setNewSubName] = useState('');

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
    setLocalCategories(localCategories.filter(c => c.id !== id));
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
      <div className="glass modal-content animate-pop" style={{ maxWidth: '600px', width: '95%', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Manage Categories</h2>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        {/* Add New Category Section */}
        <div className="glass card-p" style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem' }}>
          <label className="input-label" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Category Name</label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text" 
              className="input" 
              style={{ flex: '1 1 auto', minWidth: 0 }}
              placeholder="e.g., Food, Travel..." 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addCategory()}
            />
            <button onClick={addCategory} className="btn btn-primary" style={{ flex: '0 0 auto', padding: '0.75rem 1.25rem' }}>
              <Plus size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            {PRESET_COLORS.map(color => (
              <button 
                key={color}
                onClick={() => setNewCatColor(color)}
                style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: color, border: newCatColor === color ? '2px solid white' : 'none', 
                  cursor: 'pointer', transition: 'transform 0.2s'
                }}
                className={newCatColor === color ? 'animate-pulse' : ''}
              />
            ))}
          </div>
        </div>

        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {localCategories.map(cat => (
            <div key={cat.id} className="glass" style={{ padding: '1rem', borderRadius: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }} />
                <span style={{ fontWeight: 700, flex: 1 }}>{cat.name}</span>
                <button 
                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  className="icon-btn"
                  style={{ opacity: 1, color: expandedCat === cat.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                >
                  <ChevronRight size={18} style={{ transform: expandedCat === cat.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                <button onClick={() => removeCategory(cat.id)} className="icon-btn danger"><Trash2 size={16} /></button>
              </div>

              {expandedCat === cat.id && (
                <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem' }}>
                  <label className="input-label" style={{ fontSize: '0.65rem' }}>Sub-Categories</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      className="input" 
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                      placeholder="Add sub-category..." 
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addSubCategory(cat.id)}
                    />
                    <button onClick={() => addSubCategory(cat.id)} className="btn btn-primary" style={{ padding: '0 0.75rem' }}><Plus size={16} /></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {cat.subCategories?.map((sub, idx) => (
                      <div key={idx} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                        <span>{sub}</span>
                        <button onClick={() => removeSubCategory(cat.id, sub)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-secondary)' }}><X size={12} /></button>
                      </div>
                    ))}
                    {(!cat.subCategories || cat.subCategories.length === 0) && <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>No sub-categories yet</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {localCategories.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No categories created yet.</div>}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Save size={18} /> Finish Managing
          </button>
        </div>
      </div>
    </div>, document.body
  );
}
