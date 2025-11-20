import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // CHANGED FROM '../../firebase/config'
import { onAuthStateChanged } from 'firebase/auth';

const AdminRouteGuard = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Check if user is admin
          const adminDoc = await getDoc(doc(db, 'adminUsers', currentUser.uid));
          if (adminDoc.exists() && adminDoc.data().isAdmin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border text-center">
          <div className="flex flex-col items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold">Checking Permissions</h3>
            <p className="text-gray-600 mt-2">Verifying your access rights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Show access denied page if not admin
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m12-10a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Your account <span className="font-semibold">{user.email}</span> does not have administrator privileges.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact the system administrator to request access.
          </p>
          <button
            onClick={() => window.location.href = '/patient/dashboard'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Patient Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin - show the admin content
  return children;
};

export default AdminRouteGuard;