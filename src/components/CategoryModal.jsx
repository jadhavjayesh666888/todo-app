import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Tag, Save, ChevronRight, Search, Folder, Pencil, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e'];
const COMMON_ICONS = [
  'Folder', 'Globe', 'Laptop', 'Briefcase', 'Share2', 'Code', 'Megaphone', 
  'Smartphone', 'Heart', 'Star', 'Layout', 'Image', 'Book', 'Coffee', 'Music', 'Video',
  'Gamepad', 'ShoppingBag', 'CreditCard', 'Hash', 'PenTool', 'Compass', 'Archive'
];

const ALL_ICONS = Object.keys(LucideIcons).filter(k => 
  typeof LucideIcons[k] === 'object' && 
  k !== 'default' && 
  k !== 'createLucideIcon' && 
  !k.endsWith('Icon')
);

export default function CategoryModal({ isOpen, onClose, categories = [], onSave }) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  
  const [expandedCat, setExpandedCat] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Icon search state
  const [iconSearchTerm, setIconSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');

  useEffect(() => {
    if (isOpen) {
      setLocalCategories(categories);
    }
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const filteredIcons = iconSearchTerm.trim() === '' 
    ? COMMON_ICONS 
    : ALL_ICONS.filter(icon => icon.toLowerCase().includes(iconSearchTerm.toLowerCase()));

  const renderIcon = (name, size = 18, color = 'currentColor') => {
    const Icon = LucideIcons[name] || Folder;
    return <Icon size={size} color={color} />;
  };

  const saveCategory = () => {
    if (!newCatName.trim()) return;
    
    if (editingId) {
      setLocalCategories(localCategories.map(c => {
        const cId = typeof c === 'string' ? c : c.id;
        if (cId === editingId) {
          return { id: cId, name: newCatName, color: newCatColor, icon: selectedIcon };
        }
        return c;
      }));
      setEditingId(null);
    } else {
      const newCat = {
        id: Date.now().toString(),
        name: newCatName,
        color: newCatColor,
        icon: selectedIcon
      };
      setLocalCategories([...localCategories, newCat]);
    }
    
    setNewCatName('');
    setIconSearchTerm('');
    setSelectedIcon('Folder');
  };

  const startEdit = (cat) => {
    const isLegacy = typeof cat === 'string';
    const catId = isLegacy ? cat : cat.id;
    setEditingId(catId);
    setNewCatName(isLegacy ? cat : cat.name);
    setNewCatColor(isLegacy ? '#6366f1' : (cat.color || '#6366f1'));
    setSelectedIcon(isLegacy ? 'Folder' : (cat.icon || 'Folder'));
    // Scroll to top
    document.querySelector('.modal-content').scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeCategory = (id) => {
    setLocalCategories(localCategories.filter(c => {
      const cId = typeof c === 'string' ? c : c.id;
      return cId !== id;
    }));
  };

  const handleSave = () => {
    onSave(localCategories);
  };

  return createPortal(
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div className="glass modal-content animate-pop" style={{ maxWidth: '600px', width: '95%', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '1.5rem', backgroundColor: 'var(--surface-card)', border: 'var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Tag size={24} color="var(--accent-primary)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Manage Categories</h2>
          </div>
          <button onClick={onClose} className="icon-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Add/Edit Category Section */}
        <div className="glass" style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Category Name</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  style={{ flex: '1 1 auto', minWidth: 0, padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  placeholder="e.g., Code, Social..." 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && saveCategory()}
                />
                <button onClick={saveCategory} className="btn btn-primary" style={{ flex: '0 0 auto', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingId ? <Check size={20} /> : <Plus size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Category Color</label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(color => (
                  <button 
                    key={color}
                    type="button"
                    onClick={() => setNewCatColor(color)}
                    style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', background: color, border: newCatColor === color ? '2px solid white' : '2px solid transparent', 
                      cursor: 'pointer', transition: 'all 0.2s', boxShadow: newCatColor === color ? `0 0 10px ${color}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Select Icon (Search)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text" value={iconSearchTerm} onChange={(e) => setIconSearchTerm(e.target.value)}
                  placeholder={selectedIcon}
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                />
                <div style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: newCatColor }}>
                  {renderIcon(selectedIcon, 18)}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.4rem', marginTop: '0.75rem', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                {filteredIcons.slice(0, 40).map(name => (
                  <button
                    key={name} type="button" onClick={() => { setSelectedIcon(name); setIconSearchTerm(''); }}
                    style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: selectedIcon === name ? `${newCatColor}33` : 'rgba(255,255,255,0.02)', color: selectedIcon === name ? newCatColor : 'var(--text-disabled)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={name}
                  >
                    {renderIcon(name, 20)}
                  </button>
                ))}
                {filteredIcons.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-disabled)', gridColumn: '1 / -1' }}>No icons found.</span>}
                {filteredIcons.length > 40 && <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', gridColumn: '1 / -1', padding: '0.2rem' }}>...keep typing to see more</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Existing Categories</h3>
          {localCategories.map(cat => {
            const isLegacy = typeof cat === 'string';
            const catId = isLegacy ? cat : cat.id;
            const catName = isLegacy ? cat : cat.name;
            const catColor = isLegacy ? '#6366f1' : (cat.color || '#6366f1');
            const catIcon = isLegacy ? 'Folder' : (cat.icon || 'Folder');

            return (
              <div key={catId} className="glass" style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${catColor}22`, color: catColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {renderIcon(catIcon, 16)}
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{catName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => startEdit(cat)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => removeCategory(catId)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', opacity: 0.7, cursor: 'pointer', padding: '0.5rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {localCategories.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>No categories created yet.</div>}
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, padding: '1rem', borderRadius: '1rem', fontFamily: "'Space Grotesk', sans-serif" }}>Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
            <Save size={18} /> Finish Managing
          </button>
        </div>
      </div>
    </div>, document.body
  );
}
