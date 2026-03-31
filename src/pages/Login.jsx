import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid or incorrect credentials.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto, sans-serif' }}>
      <div className="glass animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px', backgroundColor: 'var(--surface-card)', border: 'var(--glass-border)', position: 'relative' }}>
        <button 
          onClick={toggleTheme} 
          className="btn-ghost active-press" 
          style={{ 
            position: 'absolute', top: '1rem', right: '1rem', 
            padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', borderRadius: '50%'
          }} 
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.05em' }}>Log In</h2>
        {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(248,81,73,0.1)', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input type="email" ref={emailRef} required className="input" placeholder="Enter your email" />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
               type={showPassword ? "text" : "password"} 
               ref={passwordRef} required className="input" placeholder="Enter your password" 
               style={{ width: '100%', paddingRight: '2.5rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '1rem', top: '2.4rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', opacity: 0.5
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button disabled={loading} className="btn btn-primary" type="submit" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', borderRadius: '9999px' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Need an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700, marginLeft: '0.4rem' }}>Sign Up</Link>
        </div>
        
        {/* Version Badge */}
        <div style={{ 
          position: 'absolute', bottom: '0.8rem', left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)',
          opacity: 0.5, letterSpacing: '0.05em'
        }}>
          v4.0.2
        </div>
      </div>
      {loading && <LoadingOverlay message="Logging you in..." />}
    </div>
  );
}
