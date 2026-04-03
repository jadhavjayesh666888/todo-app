import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, Save, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Profile() {
  const { currentUser, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ ...docSnap.data(), email: currentUser.email });
          setEditNameValue(docSnap.data().name || '');
        } else {
          setProfile({ name: '', email: currentUser.email });
          setEditNameValue('');
        }
      } catch (err) {
        console.error("Firestore user fetch error:", err);
        setError("Error fetching profile from database. This is usually caused by missing Firestore Security Rules for the 'users' collection. " + err.message);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [currentUser]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await changePassword(newPassword);
      setMessage('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Security check: You must log out and log back in before changing your password.');
      } else {
        setError(`Failed to update password: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!editNameValue.trim()) return;
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, { name: editNameValue.trim() }, { merge: true });
      
      setProfile(prev => ({ ...prev, name: editNameValue.trim() }));
      setMessage('Name updated successfully!');
      setIsEditingName(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (err) {
      console.error(err);
      setError('Failed to update name: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    if (profile.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  if (loadingProfile) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 500, opacity: 0.7 }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'Roboto, sans-serif' }}>
      <h1 style={{ margin: 0, paddingBottom: '0.2rem', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.06em' }}>My Profile</h1>
      
      {error && (
        <div className="animate-fade-in" style={{ 
          position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'var(--accent-danger)', color: 'white', 
          padding: '1rem 1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)',
          zIndex: 9999, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.8rem',
          maxWidth: '90%'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {message && createPortal(
        <div className="animate-fade-in" style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '1rem'
        }}>
          <div className="glass" style={{
            backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)',
            padding: '3.5rem 2.5rem', borderRadius: '1.5rem', boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem',
            textAlign: 'center', minWidth: '340px', maxWidth: '90%', border: 'none'
          }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(129, 140, 248, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)',
              marginBottom: '0.5rem'
            }}>
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>Success</h2>
            <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{message}</p>
            <button onClick={() => setMessage('')} className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.8rem 2.5rem' }}>Great</button>
          </div>
        </div>,
        document.body
      )}

      <div className="glass" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', border: 'var(--glass-border)', position: 'relative' }}>
        {/* Edit button - top right */}
        {!isEditingName && (
          <button
            onClick={() => setIsEditingName(true)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', borderRadius: '50%', transition: 'transform 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Edit2 size={18} />
          </button>
        )}

        {/* Avatar */}
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', 
          backgroundColor: 'var(--accent-primary)', color: 'white', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.4rem', fontWeight: 900, lineHeight: 1
        }}>
          {getInitial()}
        </div>
        
        {/* Name */}
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '320px' }}>
          {isEditingName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center', width: '100%', marginBottom: '0.5rem' }}>
              <input 
                type="text" 
                value={editNameValue} 
                onChange={(e) => setEditNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); if (e.key === 'Escape') setIsEditingName(false); }}
                className="input" 
                autoFocus
                placeholder="Name"
                style={{ padding: '0.7rem', textAlign: 'center', width: '100%', maxWidth: '240px', fontSize: '1.1rem', fontWeight: 600, backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
              />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button disabled={loading} onClick={handleUpdateName} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                  <Save size={16} /> Save
                </button>
                <button onClick={() => setIsEditingName(false)} className="btn" style={{ padding: '0.5rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <h2 style={{ margin: '0 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center' }}>{profile.name || 'User'}</h2>
          )}
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, opacity: 0.8, textAlign: 'center' }}>{profile.email}</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem 2rem', border: 'var(--glass-border)' }}>
        <h3 style={{ marginBottom: '1.2rem', marginTop: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>Security Settings</h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter New Password"
              className="input"
              required
              minLength={6}
              style={{ width: '100%', paddingRight: '3rem', backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', opacity: 0.7,
                display: 'flex', alignItems: 'center', padding: 0
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '9999px', fontWeight: 800 }}>
            Update Password
          </button>
        </form>

      </div>
    </div>
  );
}
