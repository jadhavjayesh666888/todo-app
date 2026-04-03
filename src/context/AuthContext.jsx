import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, functions } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create profile document
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      avatarUrl: ""
    });
    return userCredential;
  }



  async function login(email, password) {
    await setPersistence(auth, browserSessionPersistence);
    return signInWithEmailAndPassword(auth, email, password);
  }



  function logout() {
    return signOut(auth);
  }
  

  
  function changePassword(newPassword) {
    return updatePassword(currentUser, newPassword);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Inactivity Auto-Logout Tracker (15 Minutes)
  useEffect(() => {
    let timeoutId;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (currentUser) {
        // Enforce exactly 15 minutes of idle time before severing token
        timeoutId = setTimeout(() => {
          logout();
        }, 15 * 60 * 1000);
      }
    };

    if (currentUser) {
      resetTimer(); 
      const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      
      return () => {
        clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
    
    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    changePassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
