import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();


  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value);
      navigate('/');
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto, sans-serif' }}>
      <div className="glass animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px', backgroundColor: 'var(--surface-card)', border: 'var(--glass-border)', position: 'relative' }}>
        <button 
          onClick={toggleTheme} 
          className="btn-ghost" 
          style={{ 
            position: 'absolute', top: '1.2rem', right: '1.2rem', 
            padding: '0.4rem', border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--text-secondary)', opacity: 0.6
          }} 
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.05em' }}>Sign Up</h2>
        {error && <div style={{ color: 'var(--accent-danger)', backgroundColor: 'rgba(248,81,73,0.1)', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1.2rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
            <input type="text" ref={nameRef} required className="input" placeholder="Your name" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input type="email" ref={emailRef} required className="input" placeholder="Your email" />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              ref={passwordRef} required className="input" placeholder="Create a password" 
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
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
            <input 
               type={showConfirmPassword ? "text" : "password"} 
               ref={passwordConfirmRef} required className="input" placeholder="Confirm password" 
               style={{ width: '100%', paddingRight: '2.5rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute', right: '1rem', top: '2.4rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', opacity: 0.5
              }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button disabled={loading} className="btn btn-primary" type="submit" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', borderRadius: '9999px' }}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700, marginLeft: '0.4rem' }}>Log In</Link>
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
      {loading && <LoadingOverlay message="Creating your account..." />}
    </div>
  );
}
