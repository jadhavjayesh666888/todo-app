import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Pencil, CheckCircle2, Circle, Check, Pin, FileText, Star, ListTodo } from 'lucide-react';
import { createPortal } from 'react-dom';
import TodoModal from '../components/TodoModal';
import NoteModal from '../components/NoteModal';
import PreviewModal from '../components/PreviewModal';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]); // Unified items (todos + notes)
  const [filter, setFilter] = useState('all'); // 'all' | 'tasks' | 'notes'
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOpenTodo = () => { setEditingItem(null); setIsTodoModalOpen(true); };
    const handleOpenNote = () => { setEditingItem(null); setIsNoteModalOpen(true); };
    const handleResetFilter = () => setFilter('all');
    
    window.addEventListener('open-add-todo', handleOpenTodo);
    window.addEventListener('open-add-note', handleOpenNote);
    window.addEventListener('reset-filter', handleResetFilter);

    return () => {
      window.removeEventListener('open-add-todo', handleOpenTodo);
      window.removeEventListener('open-add-note', handleOpenNote);
      window.removeEventListener('reset-filter', handleResetFilter);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    setErrorMsg('');
    const q = query(
      collection(db, 'todos'), 
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(data.sort((a, b) => {
        // Priority 1: Pinned
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        // Priority 2: Starred
        if (!!a.starred !== !!b.starred) return a.starred ? -1 : 1;
        // Priority 3: Date (Newest First)
        const timeA = a.createdAt?.toMillis?.() || Number(a.createdAt) || 0;
        const timeB = b.createdAt?.toMillis?.() || Number(b.createdAt) || 0;
        return timeB - timeA;
      }));
    }, (error) => {
      setErrorMsg(error.message);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const openEditModal = (item) => {
    setEditingItem(item);
    if (item.type === 'note') {
      setIsNoteModalOpen(true);
    } else {
      setIsTodoModalOpen(true);
    }
  };

  const handleSaveItem = async (data) => {
    try {
      if (data.id) {
        const { id, ...updates } = data;
        await updateDoc(doc(db, 'todos', id), updates);
      } else {
        await addDoc(collection(db, 'todos'), {
          ...data,
          type: data.type || 'task',
          userId: currentUser.uid,
          createdAt: Date.now(),
          pinned: false,
          starred: false
        });
      }
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  const togglePin = async (itemId) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      await updateDoc(doc(db, 'todos', itemId), {
        pinned: !item.pinned
      });
    } catch (err) {
      alert("Failed to pin: " + err.message);
    }
  };

  const toggleStar = async (itemId) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      await updateDoc(doc(db, 'todos', itemId), {
        starred: !item.starred
      });
    } catch (err) {
      alert("Failed to star: " + err.message);
    }
  };

  const toggleTodoDone = async (todoId, idx) => {
    try {
      const todo = items.find(t => t.id === todoId);
      if (!todo) return;
      const newItems = [...todo.items];
      newItems[idx].done = !newItems[idx].done;
      await updateDoc(doc(db, 'todos', todoId), { items: newItems });
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    setItemToDelete(null);
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'tasks') return item.type === 'task' || !item.type;
    if (filter === 'notes') return item.type === 'note';
    if (filter === 'starred') return item.starred;
    return true;
  });

  const counts = {
    all: items.length,
    tasks: items.filter(i => i.type === 'task' || !i.type).length,
    notes: items.filter(i => i.type === 'note').length,
    starred: items.filter(i => i.starred).length
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const tabStyle = (active) => ({
    padding: '0.6rem 1.2rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-secondary)',
    border: 'none',
    boxShadow: active ? '0 4px 12px rgba(129, 140, 248, 0.3)' : 'none'
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem', fontFamily: 'Roboto, sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: "'Space Grotesk', sans-serif" }}>My Workspace</h1>
        
        {/* Tab Bar */}
        <div className="glass" style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem', borderRadius: '999px', backgroundColor: 'var(--surface-card)', border: 'var(--glass-border)' }}>
          <button onClick={() => setFilter('all')} style={tabStyle(filter === 'all')} className="active-press">
            All ({counts.all})
          </button>
          <button onClick={() => setFilter('tasks')} style={tabStyle(filter === 'tasks')} className="active-press">
            ToDos ({counts.tasks})
          </button>
          <button onClick={() => setFilter('notes')} style={tabStyle(filter === 'notes')} className="active-press">
            Notes ({counts.notes})
          </button>
          <button onClick={() => setFilter('starred')} style={tabStyle(filter === 'starred')} className="active-press">
            Starred ({counts.starred})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'var(--accent-danger)', color: 'white', padding: '1rem', borderRadius: '0.8rem', marginBottom: '2rem' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem' }}>Nothing to show here yet.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '1.5rem', alignItems: 'start'
        }}>
          {filteredItems.map(item => {
            const isNote = item.type === 'note';
            const checkedCount = !isNote ? item.items.filter(i => i.done).length : 0;
            
            return (
                <div 
                  className="glass animate-fade-in hover-lift active-press" 
                  onClick={() => { setPreviewItem(item); setIsPreviewOpen(true); }}
                  style={{ 
                    backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)', 
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    transition: 'all 0.3s ease', cursor: 'pointer', border: 'var(--glass-border)',
                    boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden',
                    borderRadius: '1.25rem',
                    borderLeft: (isNote && item.color) ? `4px solid ${item.color}` : 'var(--glass-border)',
                    borderRight: (!isNote && item.color) ? `4px solid ${item.color}` : 'var(--glass-border)',
                    outline: item.starred ? '2px solid rgba(255, 193, 7, 0.4)' : 'none',
                    backgroundColor: item.starred ? 'rgba(255, 193, 7, 0.03)' : 'var(--surface-card)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                      <div style={{ flexShrink: 0, opacity: 0.5, color: 'var(--text-secondary)' }}>
                        {isNote ? <FileText size={14} /> : <ListTodo size={14} />}
                      </div>
                      <h3 className="text-ellipsis" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.heading}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.1rem', alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleStar(item.id)} className={`card-action-btn ${item.starred ? 'starred-active' : ''}`} style={{ color: item.starred ? '#FFC107' : 'var(--text-disabled)', opacity: item.starred ? 1 : 0.4 }} title="Star item">
                      <Star size={15} fill={item.starred ? "#FFC107" : "none"} style={{ transition: 'all 0.3s ease' }} />
                    </button>
                    <button onClick={() => togglePin(item.id)} className={`card-action-btn ${item.pinned ? 'pinned-active' : ''}`} style={{ color: 'var(--accent-primary)', opacity: item.pinned ? 1 : 0.4 }} title="Pin item">
                      <Pin size={15} fill={item.pinned ? "currentColor" : "none"} style={{ transform: item.pinned ? 'rotate(0deg)' : 'rotate(-45deg)', transition: 'transform 0.3s ease' }} />
                    </button>
                    <button onClick={() => openEditModal(item)} className="card-action-btn" style={{ color: 'var(--accent-primary)' }} title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setItemToDelete(item)} className="card-action-btn" style={{ color: 'var(--accent-primary)' }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                {/* Content Rendering */}
                {isNote ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-disabled)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Added {formatDate(item.createdAt)}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[...item.items]
                        .sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1))
                        .slice(0, 3)
                        .map((sub, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleTodoDone(item.id, item.items.indexOf(sub)); }}>
                            <div style={{ 
                              width: '18px', height: '18px', borderRadius: '50%', border: sub.done ? 'none' : `2px solid var(--accent-primary)`,
                              backgroundColor: sub.done ? 'var(--accent-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              {sub.done && <Check size={10} color="white" strokeWidth={4} />}
                            </div>
                            <span className="text-ellipsis" style={{ textDecoration: sub.done ? 'line-through' : 'none', opacity: sub.done ? 0.5 : 1, fontSize: '0.9rem', fontWeight: 500, color: sub.done ? 'var(--text-disabled)' : 'inherit' }}>
                              {sub.text}
                            </span>
                          </div>
                      ))}
                      {item.items.length > 3 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.75rem', fontWeight: 800 }}>+ {item.items.length - 3} more</div>
                      )}
                    </div>
                    {(checkedCount > 0 || item.createdAt) && (
                      <div style={{ 
                        marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column', gap: '0.4rem'
                      }}>
                        {checkedCount > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 900 }}>
                            +{checkedCount} ticked ToDos
                          </div>
                        )}
                        {item.createdAt && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Added {formatDate(item.createdAt)}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        item={previewItem} 
        onEdit={openEditModal}
        onDelete={setItemToDelete}
      />

      <TodoModal isOpen={isTodoModalOpen} onClose={() => setIsTodoModalOpen(false)} onSave={handleSaveItem} initialData={editingItem} />
      <NoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={handleSaveItem} initialData={editingItem} />
      
      {itemToDelete && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface-card)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Delete {itemToDelete.type === 'note' ? 'Note' : 'List'}?</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Are you sure you want to delete "{itemToDelete.heading}"?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setItemToDelete(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={confirmDeleteItem} className="btn btn-danger" style={{ flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

