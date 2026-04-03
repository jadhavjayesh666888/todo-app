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
    if (authLoading) return;

    if (!currentUser) {
      // If not logged in, we can't save. 
      // For now, redirect to login. In a perfect world, we'd save the params and return here after login.
      navigate('/login', { replace: true });
      return;
    }

    const handleShare = async () => {
      try {
        const title = searchParams.get('title') || '';
        const text = searchParams.get('text') || '';
        const url = searchParams.get('url') || '';

        // Extract the best URL out of text or url params
        // Instagram often puts the URL in the 'text' field
        const sharedUrl = url || (text.match(/https?:\/\/[^\s]+/)?.[0]) || text;
        const sharedHeading = title || text.split(' http')[0] || 'Shared Link';

        if (!sharedUrl) {
          setStatus('No valid URL found in shared content.');
          setTimeout(() => navigate('/links', { replace: true }), 2000);
          return;
        }

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
