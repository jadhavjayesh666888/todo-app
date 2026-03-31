import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Plus, CheckCircle2, Sun, Moon, FileText } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [initial, setInitial] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchInitial() {
      if (!currentUser) return;
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        const name = snap.exists() ? snap.data().name : '';
        setInitial((name || currentUser.email || '?').charAt(0).toUpperCase());
      } catch {
        setInitial((currentUser.email || '?').charAt(0).toUpperCase());
      }
    }
    fetchInitial();

    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setIsActionMenuOpen(false);
      }
    };
    if (isActionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentUser, isActionMenuOpen]);

  const handleAction = (type) => {
    setIsActionMenuOpen(false);
    const eventName = type === 'todo' ? 'open-add-todo' : 'open-add-note';
    
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent(eventName));
    } else {
      navigate('/');
      setTimeout(() => window.dispatchEvent(new CustomEvent(eventName)), 150);
    }
  };

  const iconBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px',
    border: 'none', background: 'transparent', cursor: 'pointer',
    color: 'var(--text-secondary)', borderRadius: '50%',
    transition: 'color 0.2s, background 0.2s',
    flexShrink: 0
  };

  const menuOptionStyle = {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    width: '100%', padding: '0.75rem 1rem', border: 'none',
    background: 'transparent', color: 'var(--text-primary)',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
    transition: 'background 0.2s', borderRadius: '0.5rem',
    textAlign: 'left'
  };

  return (
    <nav className="nav-container">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => {
        window.dispatchEvent(new CustomEvent('reset-filter'));
        navigate('/');
      }}>
        <div style={{
          backgroundColor: 'var(--accent-primary)', color: 'white',
          width: '32px', height: '32px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(129, 140, 248, 0.4)'
        }}>
          <CheckCircle2 size={20} />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'Roboto, sans-serif' }}>TodoApp</span>
      </div>

      {/* Right icons — all equal 36×36 */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div className="action-menu-container" style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
            style={{ ...iconBtnStyle, backgroundColor: isActionMenuOpen ? 'rgba(129,140,248,0.1)' : 'transparent', color: isActionMenuOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }} 
            title="Create New..."
          >
            <Plus size={20} style={{ transform: isActionMenuOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {isActionMenuOpen && (
            <div className="glass animate-fade-in" style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
              minWidth: '160px', padding: '0.5rem', zIndex: 1000,
              backgroundColor: 'var(--surface-card)', border: 'var(--glass-border)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderRadius: '1rem'
            }}>
              <button 
                onClick={() => handleAction('todo')} 
                style={menuOptionStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(129,140,248,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <CheckCircle2 size={18} color="var(--accent-primary)" />
                <span>New Todo</span>
              </button>
              <button 
                onClick={() => handleAction('note')} 
                style={menuOptionStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(129,140,248,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={18} color="var(--accent-primary)" />
                <span>New Note</span>
              </button>
            </div>
          )}
        </div>


        <button onClick={toggleTheme} style={iconBtnStyle} title="Toggle Theme"
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(129,140,248,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Avatar circle */}
        <div
          onClick={() => navigate('/profile')}
          title="Profile"
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(129, 140, 248, 0.35)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
            userSelect: 'none', flexShrink: 0
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(129,140,248,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(129,140,248,0.35)'; }}
        >
          {initial}
        </div>

        <button onClick={logout} style={{ ...iconBtnStyle, color: 'var(--accent-danger)' }} title="Logout"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,81,73,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <LogOut size={20} />
        </button>
      </div>
    </nav>

  );
};

export default Navbar;
