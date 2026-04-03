import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon, ArrowLeft, Mail, Package } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isResetMode) {
      try {
        setLoading(true);
        await resetPassword(emailRef.current.value);
        setMessage('Check your inbox for further instructions.');
        // After sending, maybe stay on reset mode to show message or toggle back
      } catch (err) {
        setError('Failed to reset password. Please check your email.');
      }
    } else {
      try {
        setLoading(true);
        await login(emailRef.current.value, passwordRef.current.value);
        // Relying on AuthContext state update in App.jsx for redirection
      } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Invalid or incorrect credentials.');
        } else if (err.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else {
          setError('Failed to log in. Please check your credentials.');
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '1rem' }}>
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

        {isResetMode && (
          <button 
            onClick={() => { setIsResetMode(false); setError(''); setMessage(''); }}
            style={{ 
              position: 'absolute', top: '1rem', left: '1rem', 
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.8rem', fontWeight: 700
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(129, 140, 248, 0.4)', marginBottom: '1.2rem'
          }}>
            <Package size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.4rem', fontFamily: "'Space Grotesk', sans-serif" }}>MineBox</h1>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {isResetMode ? 'Reset your password' : 'Login to your account'}
          </h2>
        </div>

        {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(248,81,73,0.1)', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        {message && <div style={{ color: 'var(--accent-primary)', backgroundColor: 'rgba(129,140,248,0.1)', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input type="email" ref={emailRef} required className="input" placeholder="Enter your email" />
          </div>

          {!isResetMode && (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <button 
                  type="button" 
                  onClick={() => { setIsResetMode(true); setError(''); setMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>
              <input 
                 type={showPassword ? "text" : "password"} 
                 ref={passwordRef} required className="input" placeholder="Enter your password" 
                 style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '1rem', top: '2.45rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', opacity: 0.5
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button disabled={loading} className="btn btn-primary" type="submit" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isResetMode ? <Mail size={18} /> : null}
            {loading ? (isResetMode ? 'Sending...' : 'Logging in...') : (isResetMode ? 'Send Reset Link' : 'Log In')}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {isResetMode ? "Remember your password?" : "Need an account?"} 
          <Link 
            to={isResetMode ? "/login" : "/signup"} 
            onClick={() => { if(isResetMode) { setIsResetMode(false); setError(''); setMessage(''); } }}
            style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700, marginLeft: '0.4rem' }}
          >
            {isResetMode ? 'Log In' : 'Sign Up'}
          </Link>
        </div>
        
        {/* Version Badge */}
        <div style={{ 
          position: 'absolute', bottom: '0.8rem', left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)',
          opacity: 0.5, letterSpacing: '0.05em'
        }}>
          v5.0.0
        </div>
      </div>
      {loading && <LoadingOverlay message={isResetMode ? "Sending reset email..." : "Logging you in..."} />}
    </div>
  );
}
