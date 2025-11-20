// frontend/src/hooks/useAdmin.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
          setIsAdmin(adminDoc.exists() && adminDoc.data().isAdmin === true);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading };
};