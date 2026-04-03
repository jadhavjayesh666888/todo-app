import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, IndianRupee, ChevronDown } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose, onSave, categories, initialData }) {
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    subCategory: '',
    description: '',
    date: new Date().toLocaleDateString('en-CA')
  });

  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isSubCatOpen, setIsSubCatOpen] = useState(false);
  const catRef = useRef(null);
  const subCatRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        amount: '',
        categoryId: categories[0]?.id || '',
        subCategory: '',
        description: '',
        date: new Date().toLocaleDateString('en-CA')
      });
    }
  }, [initialData, categories, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setIsCatOpen(false);
      if (subCatRef.current && !subCatRef.current.contains(e.target)) setIsSubCatOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) return;
    
    onSave({
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date).getTime()
    });
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  return createPortal(
    <div className="modal-overlay">
      <div className="glass modal-content animate-pop" style={{ maxWidth: '500px', width: '90%', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{initialData ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Amount input */}
          <div>
            <label className="input-label">Amount (₹)</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <IndianRupee size={18} />
              </div>
              <input 
                type="number" 
                required 
                className="input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <input 
              type="text" 
              required 
              className="input" 
              placeholder="What was this for?"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div ref={catRef} style={{ position: 'relative' }}>
              <label className="input-label">Category</label>
              <div 
                className="input" 
                onClick={() => setIsCatOpen(!isCatOpen)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{categories.find(c => c.id === formData.categoryId)?.name || 'Select Category...'}</span>
                <ChevronDown size={18} style={{ color: 'var(--text-disabled)', transform: isCatOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              
              {isCatOpen && (
                <div className="glass animate-pop" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
                  backgroundColor: 'var(--surface-card)', borderRadius: '1rem', border: '1px solid var(--border-color)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden', padding: '0.5rem'
                }}>
                  <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {categories.length === 0 && <div style={{ padding: '0.7rem 1rem', color: 'var(--text-disabled)' }}>Add a category first</div>}
                    {categories.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => { setFormData({ ...formData, categoryId: c.id, subCategory: '' }); setIsCatOpen(false); }}
                        style={{ padding: '0.7rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', backgroundColor: formData.categoryId === c.id ? 'rgba(255,255,255,0.05)' : 'transparent', color: formData.categoryId === c.id ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: formData.categoryId === c.id ? 700 : 400 }}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div ref={subCatRef} style={{ position: 'relative' }}>
              <label className="input-label">Sub-Category</label>
              <div 
                className="input" 
                onClick={() => setIsSubCatOpen(!isSubCatOpen)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: selectedCategory ? 1 : 0.5, pointerEvents: selectedCategory ? 'auto' : 'none' }}
              >
                <span>{formData.subCategory || 'None'}</span>
                <ChevronDown size={18} style={{ color: 'var(--text-disabled)', transform: isSubCatOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              
              {isSubCatOpen && selectedCategory && (
                <div className="glass animate-pop" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
                  backgroundColor: 'var(--surface-card)', borderRadius: '1rem', border: '1px solid var(--border-color)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden', padding: '0.5rem'
                }}>
                  <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div 
                      onClick={() => { setFormData({ ...formData, subCategory: '' }); setIsSubCatOpen(false); }}
                      style={{ padding: '0.7rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', backgroundColor: !formData.subCategory ? 'rgba(255,255,255,0.05)' : 'transparent', color: !formData.subCategory ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: !formData.subCategory ? 700 : 400 }}
                    >
                      None
                    </div>
                    {selectedCategory.subCategories?.map((sc, i) => (
                      <div 
                        key={i}
                        onClick={() => { setFormData({ ...formData, subCategory: sc }); setIsSubCatOpen(false); }}
                        style={{ padding: '0.7rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', backgroundColor: formData.subCategory === sc ? 'rgba(255,255,255,0.05)' : 'transparent', color: formData.subCategory === sc ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: formData.subCategory === sc ? 700 : 400 }}
                      >
                        {sc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="input-label">Date</label>
            <input 
              type="date" 
              required 
              className="input" 
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={18} /> Save Expense
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .modal-content { padding: 2rem; border-radius: 1.5rem; }
        .input-label { display: block; margin-bottom: 0.6rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .icon-btn { padding: 0.5rem; background: transparent; border: none; cursor: pointer; color: var(--text-secondary); opacity: 0.5; transition: opacity 0.2s; }
        .icon-btn:hover { opacity: 1; }
      `}</style>
    </div>, document.body
  );
}
