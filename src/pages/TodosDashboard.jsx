import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Pencil, Check, Pin, Star, ListTodo } from 'lucide-react';
import { createPortal } from 'react-dom';
import TodoModal from '../components/TodoModal';
import PreviewModal from '../components/PreviewModal';
import TodoCategoryModal from '../components/TodoCategoryModal';
import * as LucideIcons from 'lucide-react';
import { Tag, Settings2, Folder } from 'lucide-react';

export default function TodosDashboard() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOpen = () => { setEditingItem(null); setIsTodoModalOpen(true); };
    window.addEventListener('open-add-todo', handleOpen);
    return () => window.removeEventListener('open-add-todo', handleOpen);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setErrorMsg('');
    
    // Listen for todo categories
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        let cats = userData.todoCategories || [];
        
        // Initialize defaults if empty
        if (cats.length === 0) {
          const defaults = [
            { id: 'cat_movies', name: 'Movies', icon: 'Film', color: '#ef4444' },
            { id: 'cat_books', name: 'Books', icon: 'Book', color: '#f59e0b' },
            { id: 'cat_personal', name: 'Personal', icon: 'Heart', color: '#ec4899' },
            { id: 'cat_work', name: 'Work', icon: 'Briefcase', color: '#6366f1' }
          ];
          updateDoc(userRef, { todoCategories: defaults });
          setCategories(defaults);
        } else {
          setCategories(cats);
        }
      }
    });

    const q = query(
      collection(db, 'todos'),
      where('userId', '==', currentUser.uid),
      where('type', '==', 'task')
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

    return () => {
      unsubUser();
      unsubscribe();
    };
  }, [currentUser]);

  const openEditModal = (item) => { setEditingItem(item); setIsTodoModalOpen(true); };

  const handleSaveItem = async (data) => {
    try {
      if (data.id) {
        const { id, ...updates } = data;
        await updateDoc(doc(db, 'todos', id), updates);
      } else {
        await addDoc(collection(db, 'todos'), {
          ...data, type: 'task', userId: currentUser.uid,
          createdAt: Date.now(), pinned: false, starred: false
        });
      }
      setIsTodoModalOpen(false);
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

  const toggleTodoDone = async (todoId, idx) => {
    const todo = items.find(t => t.id === todoId);
    if (!todo) return;
    const newItems = [...todo.items];
    newItems[idx].done = !newItems[idx].done;
    await updateDoc(doc(db, 'todos', todoId), { items: newItems });
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

  const filteredItems = items.filter(item => {
    if (filter === 'starred' && !item.starred) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const handleSaveCategories = async (newCats) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { todoCategories: newCats });
      setIsCategoryModalOpen(false);
    } catch (err) { alert('Failed to save categories: ' + err.message); }
  };

  const counts = { 
    all: items.length, 
    starred: items.filter(i => i.starred).length 
  };

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
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: "'Space Grotesk', sans-serif" }}>Todos</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="glass" style={{ display: 'flex', gap: '0.4rem', padding: '0.35rem', borderRadius: '999px', backgroundColor: 'var(--surface-card)', border: 'var(--glass-border)' }}>
            <button onClick={() => setFilter('all')} style={tabStyle(filter === 'all')}>All</button>
            <button onClick={() => setFilter('starred')} style={{ ...tabStyle(filter === 'starred'), display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={13} fill={filter === 'starred' ? 'currentColor' : 'none'} /> Starred
            </button>
          </div>
          <button 
            onClick={() => setIsCategoryModalOpen(true)} 
            className="btn btn-ghost" 
            style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
          >
            <Settings2 size={18} /> Manage Collections
          </button>
          <button onClick={() => { setEditingItem(null); setIsTodoModalOpen(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
            <Plus size={18} /> New Todo
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1.5rem', 
        marginBottom: '1rem', scrollbarWidth: 'none', msOverflowStyle: 'none'
      }} className="no-scrollbar">
        <button 
          onClick={() => setCategoryFilter('all')}
          style={{
            whiteSpace: 'nowrap', padding: '0.6rem 1.25rem', borderRadius: '12px',
            backgroundColor: categoryFilter === 'all' ? 'var(--accent-primary)' : 'var(--surface-card)',
            color: categoryFilter === 'all' ? 'white' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          All Collections
        </button>
        <button 
          onClick={() => setCategoryFilter('Uncategorized')}
          style={{
            whiteSpace: 'nowrap', padding: '0.6rem 1.25rem', borderRadius: '12px',
            backgroundColor: categoryFilter === 'Uncategorized' ? 'var(--accent-primary)' : 'var(--surface-card)',
            color: categoryFilter === 'Uncategorized' ? 'white' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Uncategorized
        </button>
        {categories.map(cat => {
          const Icon = LucideIcons[cat.icon] || Folder;
          const isActive = categoryFilter === cat.id;
          return (
            <button 
              key={cat.id} 
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                whiteSpace: 'nowrap', padding: '0.6rem 1.25rem', borderRadius: '12px',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--surface-card)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s'
              }}
            >
              <Icon size={14} color={isActive ? 'white' : cat.color} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {errorMsg && <div style={{ backgroundColor: 'var(--accent-danger)', color: 'white', padding: '1rem', borderRadius: '0.8rem', marginBottom: '2rem' }}><strong>Error:</strong> {errorMsg}</div>}

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem' }}>{filter === 'starred' ? 'No starred todos yet.' : 'No todos yet. Start creating one!'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {filteredItems.map(item => {
            const checkedCount = (item.items || []).filter(i => i.done).length;
            const totalCount = (item.items || []).length;
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
                  borderRight: item.color ? `4px solid ${item.color}` : 'var(--glass-border)',
                  outline: item.starred ? '2px solid rgba(255,193,7,0.4)' : 'none'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <div style={{ flexShrink: 0 }}>
                      {(() => {
                        const cat = categories.find(c => c.id === item.category);
                        const Icon = cat ? (LucideIcons[cat.icon] || Folder) : ListTodo;
                        return <Icon size={14} color={cat ? cat.color : 'var(--accent-primary)'} />;
                      })()}
                    </div>
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

                {item.subCategory && (
                  <div style={{ display: 'flex' }}>
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', 
                      borderRadius: '6px', backgroundColor: 'rgba(129,140,248,0.1)', 
                      color: 'var(--accent-primary)', border: '1px solid rgba(129,140,248,0.2)'
                    }}>
                      {item.subCategory}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                  {(item.items || []).length === 0 && (
                    <div style={{ 
                      fontSize: '0.85rem', color: 'var(--text-disabled)', 
                      padding: '0.5rem 0', fontStyle: 'italic',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <Plus size={14} /> Add ToDo
                    </div>
                  )}
                  {[...(item.items || [])]
                    .filter(sub => !sub.done)
                    .slice(0, 3)
                    .map((sub, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); toggleTodoDone(item.id, item.items.indexOf(sub)); }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          border: sub.done ? 'none' : `2px solid var(--accent-primary)`,
                          backgroundColor: sub.done ? 'var(--accent-primary)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {sub.done && <Check size={10} color="white" strokeWidth={4} />}
                        </div>
                        <span className="text-ellipsis" style={{ textDecoration: sub.done ? 'line-through' : 'none', opacity: sub.done ? 0.5 : 1, fontSize: '0.9rem', fontWeight: 500, color: sub.done ? 'var(--text-disabled)' : 'inherit' }}>
                          {sub.text}
                        </span>
                      </div>
                    ))}
                  {(() => {
                    const activeItems = (item.items || []).filter(sub => !sub.done);
                    if (activeItems.length > 3) {
                      return (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', paddingLeft: '1.75rem', fontWeight: 700 }}>
                          + {activeItems.length - 3} more
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {checkedCount > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 900 }}>
                      +{checkedCount} ticked todo of {(item.items || []).length} Total
                    </div>
                  )}
                  {item.createdAt && <div style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Added {formatDate(item.createdAt)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} item={previewItem} onEdit={openEditModal} onDelete={setItemToDelete} />
      <TodoModal isOpen={isTodoModalOpen} onClose={() => setIsTodoModalOpen(false)} onSave={handleSaveItem} initialData={editingItem} categories={categories} />
      <TodoCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onSave={handleSaveCategories} />

      {itemToDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface-card)', padding: '2rem', borderRadius: '1.5rem', textAlign: 'center' }}>
            <h3>Delete List?</h3>
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
