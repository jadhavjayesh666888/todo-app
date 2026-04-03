import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoadingOverlay from '../components/LoadingOverlay';

export default function ShareTarget() {
  const [searchParams] = useSearchParams();
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing share...');

  useEffect(() => {
    // 1. Wait for Auth to initialize
    if (authLoading) return;

    // 2. Identify shared data (from URL or localStorage)
    const title = searchParams.get('title');
    const text = searchParams.get('text');
    const url = searchParams.get('url');
    
    let shareData = null;
    if (url || text || title) {
      shareData = { title, text, url };
      // Save it temporarily in case we need to log in
      localStorage.setItem('pendingShare', JSON.stringify(shareData));
    } else {
      const saved = localStorage.getItem('pendingShare');
      if (saved) shareData = JSON.parse(saved);
    }

    // 3. Handle Logged Out State
    if (!currentUser) {
      if (shareData) {
        setStatus('Please log in to save your link...');
        setTimeout(() => navigate('/login', { replace: true }), 1000);
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }

    // 4. Handle Save Logic
    if (!shareData) {
      navigate('/links', { replace: true });
      return;
    }

    const handleShare = async () => {
      try {
        const { title, text, url } = shareData;

        // Extract the best URL out of text or url params
        const sharedUrl = url || (text.match(/https?:\/\/[^\s]+/)?.[0]) || text;
        
        // Smart Heading Logic
        let sharedHeading = title || 'Shared Link';
        if (!title || title === 'Shared Link') {
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
            sharedHeading = text.split(' http')[0] || 'Shared Link';
          }
        }

        if (!sharedUrl) {
          setStatus('No valid link found.');
          localStorage.removeItem('pendingShare');
          setTimeout(() => navigate('/links', { replace: true }), 2000);
          return;
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
        
        // Clean up
        localStorage.removeItem('pendingShare');
        setStatus('Link saved to Links Hub!');
        setTimeout(() => navigate('/links', { replace: true }), 1000);
      } catch (err) {
        console.error('Share Target Error:', err);
        setStatus('Failed to save shared link: ' + err.message);
        setTimeout(() => navigate('/links', { replace: true }), 3000);
      }
    };

    handleShare();
  }, [currentUser, authLoading, searchParams, navigate]);

  return <LoadingOverlay message={status} />;
}
