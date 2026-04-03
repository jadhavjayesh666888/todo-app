import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Pencil, Pin, FileText, Star } from 'lucide-react';
import { createPortal } from 'react-dom';
import NoteModal from '../components/NoteModal';
import PreviewModal from '../components/PreviewModal';

export default function NotesDashboard() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOpen = () => { setEditingItem(null); setIsNoteModalOpen(true); };
    window.addEventListener('open-add-note', handleOpen);
    return () => window.removeEventListener('open-add-note', handleOpen);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setErrorMsg('');
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', currentUser.uid),
      where('type', '==', 'note')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data.sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        const timeA = a.createdAt?.toMillis?.() || Number(a.createdAt) || 0;
        const timeB = b.createdAt?.toMillis?.() || Number(b.createdAt) || 0;
        return timeB - timeA;
      }));
    }, (err) => setErrorMsg(err.message));
    return () => unsubscribe();
  }, [currentUser]);

  const openEditModal = (item) => { setEditingItem(item); setIsNoteModalOpen(true); };

  const handleSaveItem = async (data) => {
    try {
      if (data.id) {
        const { id, ...updates } = data;
        await updateDoc(doc(db, 'todos', id), updates);
      } else {
        await addDoc(collection(db, 'todos'), {
          ...data, type: 'note', userId: currentUser.uid,
          createdAt: Date.now(), pinned: false, starred: false
        });
      }
      setIsNoteModalOpen(false);
    } catch (err) { alert('Failed to save: ' + err.message); }
  };

  const togglePin = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    await updateDoc(doc(db, 'todos', itemId), { pinned: !item.pinned });
  };

  const toggleStar = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    await updateDoc(doc(db, 'todos', itemId), { starred: !item.starred });
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    setItemToDelete(null);
    await deleteDoc(doc(db, 'todos', id));
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredItems = filter === 'starred' ? items.filter(i => i.starred) : items;
  const counts = { all: items.length, starred: items.filter(i => i.starred).length };

  const tabStyle = (active) => ({
    padding: '0.5rem 1.1rem', borderRadius: '999px', fontSize: '0.82rem',
    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-secondary)', border: 'none',
    boxShadow: active ? '0 4px 12px rgba(129,140,248,0.3)' : 'none'
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem', fontFamily: 'Roboto, sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: "'Space Grotesk', sans-serif" }}>Notes</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="glass" style={{ display: 'flex', gap: '0.4rem', padding: '0.35rem', borderRadius: '999px', backgroundColor: 'var(--surface-card)', border: 'var(--glass-border)' }}>
            <button onClick={() => setFilter('all')} style={tabStyle(filter === 'all')}>All ({counts.all})</button>
            <button onClick={() => setFilter('starred')} style={{ ...tabStyle(filter === 'starred'), display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={13} fill={filter === 'starred' ? 'currentColor' : 'none'} /> Starred ({counts.starred})
            </button>
          </div>
          <button onClick={() => { setEditingItem(null); setIsNoteModalOpen(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
            <Plus size={18} /> New Note
          </button>
        </div>
      </div>

      {errorMsg && <div style={{ backgroundColor: 'var(--accent-danger)', color: 'white', padding: '1rem', borderRadius: '0.8rem', marginBottom: '2rem' }}><strong>Error:</strong> {errorMsg}</div>}

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem' }}>{filter === 'starred' ? 'No starred notes yet.' : 'No notes yet. Keep track of your ideas here!'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {filteredItems.map(item => {
            return (
              <div
                key={item.id}
                className="glass animate-fade-in hover-lift active-press card-enter"
                onClick={() => { setPreviewItem(item); setIsPreviewOpen(true); }}
                style={{
                  backgroundColor: item.starred ? 'rgba(255,193,7,0.03)' : 'var(--surface-card)',
                  color: 'var(--text-primary)', padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  transition: 'all 0.3s ease', cursor: 'pointer', border: 'var(--glass-border)',
                  boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden',
                  borderRadius: '1.25rem',
                  borderLeft: item.color ? `4px solid ${item.color}` : 'var(--glass-border)',
                  outline: item.starred ? '2px solid rgba(255,193,7,0.4)' : 'none'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <div style={{ flexShrink: 0, color: 'var(--accent-primary)', opacity: 0.7 }}><FileText size={14} /></div>
                    <h3 className="text-ellipsis" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.heading}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.1rem', alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleStar(item.id)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: item.starred ? '#FFC107' : 'var(--text-disabled)', cursor: 'pointer', opacity: item.starred ? 1 : 0.5 }}>
                      <Star size={15} fill={item.starred ? '#FFC107' : 'none'} />
                    </button>
                    <button onClick={() => togglePin(item.id)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--accent-primary)', opacity: item.pinned ? 1 : 0.4, cursor: 'pointer' }}>
                      <Pin size={15} fill={item.pinned ? 'currentColor' : 'none'} style={{ transform: item.pinned ? 'rotate(0deg)' : 'rotate(-45deg)', transition: 'transform 0.3s ease' }} />
                    </button>
                    <button onClick={() => openEditModal(item)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setItemToDelete(item)} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer', opacity: 0.7 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Note content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-disabled)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Added {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} item={previewItem} onEdit={openEditModal} onDelete={setItemToDelete} />
      <NoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={handleSaveItem} initialData={editingItem} />

      {itemToDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface-card)', padding: '2rem', borderRadius: '1.5rem', textAlign: 'center' }}>
            <h3>Delete Note?</h3>
            <p>Are you sure you want to delete "{itemToDelete.heading}"?</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setItemToDelete(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={confirmDeleteItem} className="btn btn-danger" style={{ flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
