import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoadingOverlay from '../components/LoadingOverlay';
import { Share2, AlertCircle, Save, CheckCircle } from 'lucide-react';

export default function ShareTarget() {
  const [searchParams] = useSearchParams();
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing share...');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShare = async (manualData = null) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Identify shared data
      const title = searchParams.get('title');
      const text = searchParams.get('text');
      const url = searchParams.get('url');
      
      let shareData = manualData;
      if (!shareData) {
        if (url || text || title) {
          shareData = { title, text, url };
          localStorage.setItem('pendingShare', JSON.stringify(shareData));
        } else {
          const saved = localStorage.getItem('pendingShare');
          if (saved) shareData = JSON.parse(saved);
        }
      }

      // 2. Auth Check
      if (!currentUser) {
        if (shareData) {
          setStatus('Account required. Redirecting to login...');
          setTimeout(() => navigate('/login', { replace: true }), 1500);
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      // 3. Validation
      if (!shareData) {
        setStatus('No shared content found.');
        setTimeout(() => navigate('/links', { replace: true }), 2000);
        return;
      }

      const { title: sTitle, text: sText, url: sUrl } = shareData;

      // Extract URL
      const sharedUrl = sUrl || (sText?.match(/https?:\/\/[^\s]+/)?.[0]) || sText;
      
      if (!sharedUrl) {
        setError('Could not find a valid link in shared content.');
        setIsProcessing(false);
        return;
      }

      // Smart Heading
      let sharedHeading = sTitle || 'Shared Link';
      if (!sTitle || sTitle === 'Shared Link') {
        try {
          const urlObj = new URL(sharedUrl);
          const domain = urlObj.hostname.replace('www.', '');
          
          if (domain.includes('instagram.com')) sharedHeading = 'Instagram Reel';
          else if (domain.includes('youtube.com') || domain.includes('youtu.be')) sharedHeading = 'YouTube Video';
          else if (domain.includes('linkedin.com')) sharedHeading = 'LinkedIn Post';
          else if (domain.includes('twitter.com') || domain.includes('x.com')) sharedHeading = 'X Post';
          else if (domain.includes('github.com')) sharedHeading = 'GitHub Repo';
          else sharedHeading = `Link from ${domain}`;
        } catch {
          sharedHeading = sText?.split(' http')[0] || 'Shared Link';
        }
      }

      setStatus(`Saving "${sharedHeading}"...`);

      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      const currentLinks = snap.exists() ? (snap.data().links || []) : [];
      
      const newLink = {
        id: Date.now().toString(),
        heading: sharedHeading,
        url: sharedUrl,
        category: 'Uncategorized',
        createdAt: Date.now(),
        pinned: false,
        starred: false
      };

      const updated = [...currentLinks, newLink];
      await setDoc(userRef, { links: updated }, { merge: true });
      
      localStorage.removeItem('pendingShare');
      setStatus('Success! Link saved.');
      setTimeout(() => navigate('/links', { replace: true }), 1000);
    } catch (err) {
      console.error('Share Target Error:', err);
      setError('Failed to save: ' + err.message);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    handleShare();
  }, [currentUser, authLoading]);

  if (authLoading || (isProcessing && !error)) {
    return <LoadingOverlay message={status} />;
  }

  return (
    <div className="animate-fade-in" style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      padding: '2rem', background: 'var(--bg-primary)' 
    }}>
      <div className="glass" style={{ 
        maxWidth: '400px', width: '100%', padding: '2.5rem', borderRadius: '2rem', 
        textAlign: 'center', border: 'var(--glass-border)' 
      }}>
        {error ? (
          <>
            <div style={{ color: 'var(--accent-danger)', marginBottom: '1.5rem' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Oops!</h2>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{error}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => handleShare()} 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Save size={18} /> Try Saving Again
              </button>
              <button onClick={() => navigate('/links')} className="btn btn-ghost" style={{ width: '100%' }}>
                Go to Links Hub
              </button>
            </div>
          </>
        ) : (
          <>
            <Share2 size={48} className="animate-pulse" style={{ color: 'var(--accent-primary)', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Share Target</h2>
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Working on your shared content...</p>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          </>
        )}
      </div>
    </div>
  );
}
