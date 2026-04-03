import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { Plus, Trash2, Pencil, Pin, Star, Link as LinkIcon, ExternalLink, Tag, Globe, Settings, Folder } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { createPortal } from 'react-dom';
import LinkModal from '../components/LinkModal';
import CategoryModal from '../components/CategoryModal';

export default function LinksDashboard() {
  const { currentUser } = useAuth();
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('All');
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Navbar 'open-add-link' event
  useEffect(() => {
    const handleOpen = () => { setEditingItem(null); setIsLinkModalOpen(true); };
    window.addEventListener('open-add-link', handleOpen);
    return () => window.removeEventListener('open-add-link', handleOpen);
  }, []);

  // Sync with Firestore
  useEffect(() => {
    if (!currentUser) return;
    setErrorMsg('');
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        
        // 1. Process Links
        const rawLinks = data.links || [];
        const sortedLinks = [...rawLinks].sort((a, b) => {
          if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        setLinks(sortedLinks);
        
        // 2. Process Categories (Migration support: convert strings to objects)
        const rawCats = data.linkCategories || [];
        const processedCats = rawCats.map(cat => {
          if (typeof cat === 'string') {
            return { id: cat, name: cat, icon: 'Folder', color: '#6366f1' };
          }
          return cat;
        });
        setCategories(processedCats);
      } else {
        setLinks([]);
        setCategories([]);
      }
      setLoading(false);
    }, (err) => {
      setErrorMsg('Error fetching links Hub Data: ' + err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // CATEGORY ACTIONS
  const handleSaveCategories = async (updatedCategories) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { linkCategories: updatedCategories }, { merge: true });
      setIsCategoryModalOpen(false);
    } catch (err) { alert('Failed to save categories: ' + err.message); }
  };



  // LINK ACTIONS
  const handleSaveLink = async (linkData) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      const currentLinks = snap.exists() ? (snap.data().links || []) : [];
      let updated;

      if (linkData.id) {
        updated = currentLinks.map(l => l.id === linkData.id ? { ...l, ...linkData } : l);
      } else {
        const newLink = { 
          ...linkData, 
          id: Date.now().toString(), 
          createdAt: Date.now(), 
          pinned: false, 
          starred: false 
        };
        updated = [...currentLinks, newLink];
      }

      await setDoc(userRef, { links: updated }, { merge: true });
      setIsLinkModalOpen(false);
    } catch (err) { alert('Failed to save link: ' + err.message); }
  };

  const togglePin = async (id) => {
    const userRef = doc(db, 'users', currentUser.uid);
    const updated = links.map(l => l.id === id ? { ...l, pinned: !l.pinned } : l);
    await setDoc(userRef, { links: updated }, { merge: true });
  };

  const toggleStar = async (id) => {
    const userRef = doc(db, 'users', currentUser.uid);
    const updated = links.map(l => l.id === id ? { ...l, starred: !l.starred } : l);
    await setDoc(userRef, { links: updated }, { merge: true });
  };

  const confirmDeleteLink = async () => {
    if (!itemToDelete) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const updated = links.filter(l => l.id !== itemToDelete.id);
    await setDoc(userRef, { links: updated }, { merge: true });
    setItemToDelete(null);
  };

  // HELPERS
  const renderIcon = (name, size = 18, color) => {
    const Icon = LucideIcons[name] || Folder;
    return <Icon size={size} color={color} />;
  };

  const getCategoryTheme = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat || { color: 'var(--accent-primary)', icon: 'LinkIcon' };
  };

  const filteredLinks = links.filter(l => {
    // Check Category Filter
    let matchesFilter = true;
    if (filter !== 'All') {
      if (filter === 'Starred') matchesFilter = l.starred;
      else matchesFilter = l.category === filter;
    }

    // Check Search Query
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      matchesSearch = (l.heading && l.heading.toLowerCase().includes(query)) || 
                      (l.url && l.url.toLowerCase().includes(query));
    }

    return matchesFilter && matchesSearch;
  });

  // Calculate active categories (categories that have at least 1 link)
  const activeCategoryIds = new Set(links.map(l => l.category));
  const activeCategories = categories.filter(cat => activeCategoryIds.has(cat.id));


  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6rem', color: 'var(--text-secondary)' }}>Syncing Links...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '5rem', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: "'Space Grotesk', sans-serif" }}>Links Hub</h1>
        
        {/* Search Bar */}
        <div style={{ flex: '1 1 250px', maxWidth: '400px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)', pointerEvents: 'none' }}>
            <LucideIcons.Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search links..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => { setIsCategoryModalOpen(true); }} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
            <Settings size={18} /> Manage Categories
          </button>
          <button onClick={() => { setEditingItem(null); setIsLinkModalOpen(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.5rem', borderRadius: '14px' }}>
            <Plus size={20} /> New Link
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Categories Bar (Multi-line layout instead of horizontal scroll) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => setFilter('All')} style={tabStyle(filter === 'All')}>
            <Globe size={16} /> All
          </button>
          <button onClick={() => setFilter('Starred')} style={tabStyle(filter === 'Starred')}>
            <Star size={16} fill={filter === 'Starred' ? 'white' : 'none'} /> Starred
          </button>
          {activeCategories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilter(cat.id)} 
              style={tabStyle(filter === cat.id, cat.color)}
            >
              {renderIcon(cat.icon, 16, filter === cat.id ? 'white' : cat.color)}
              {cat.name}
            </button>
          ))}
          {activeCategoryIds.has('Uncategorized') && (
            <button onClick={() => setFilter('Uncategorized')} style={tabStyle(filter === 'Uncategorized', '#6b7280')}>
              <Folder size={16} /> Uncategorized
            </button>
          )}
        </div>


        {/* Links Grid */}
        {filteredLinks.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>No links found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filteredLinks.map(link => {
              const theme = getCategoryTheme(link.category);
              return (
                <div key={link.id} className="glass hover-lift active-press" style={{ 
                  borderRadius: '1.25rem', padding: '1rem', border: 'var(--glass-border)',
                  borderLeft: `5px solid ${theme.color}`, display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${theme.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {renderIcon(theme.icon, 16, theme.color)}
                      </div>
                      <h3 className="text-ellipsis" style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>{link.heading}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                      <button onClick={() => toggleStar(link.id)} style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: link.starred ? '#FFC107' : 'var(--text-disabled)', cursor: 'pointer' }}>
                        <Star size={14} fill={link.starred ? '#FFC107' : 'none'} />
                      </button>
                      <button onClick={() => togglePin(link.id)} style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--accent-primary)', opacity: link.pinned ? 1 : 0.4, cursor: 'pointer' }}>
                        <Pin size={14} fill={link.pinned ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => { setEditingItem(link); setIsLinkModalOpen(true); }} style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setItemToDelete(link)} style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer', opacity: 0.7 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover-lift" style={{ 
                    display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', 
                    textDecoration: 'none', color: 'var(--text-secondary)', gap: '0.75rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-ellipsis" style={{ fontSize: '0.85rem', color: theme.color, fontWeight: 700 }}>{link.url.replace(/^https?:\/\//i, '')}</div>
                    </div>
                    <ExternalLink size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} onSave={handleSaveLink} initialData={editingItem} categories={categories} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={handleSaveCategories} categories={categories} />

      {/* Delete Confirmation */}
      {itemToDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', textAlign: 'center', maxWidth: '400px' }}>
            <h3>Delete Link?</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setItemToDelete(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={confirmDeleteLink} className="btn btn-danger" style={{ flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>, document.body
      )}


    </div>
  );

  function tabStyle(active, color = 'var(--accent-primary)') {
    const baseColor = active ? 'white' : 'var(--text-secondary)';
    const bg = active ? color : 'rgba(255,255,255,0.03)';
    return {
      padding: '0.6rem 1.1rem', borderRadius: '14px', fontSize: '0.82rem',
      fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s',
      backgroundColor: bg, color: baseColor, border: '1px solid var(--border-color)',
      boxShadow: active ? `0 8px 20px ${color}44` : 'none',
      display: 'flex', alignItems: 'center', gap: '0.5rem', outline: 'none'
    };
  }
}
