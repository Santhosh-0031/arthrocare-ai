// src/App.jsx - UPDATED & SECURE VERSION
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientPage from "./pages/PatientPage";
import AdminPage from "./pages/AdminPage";
import PatientDashboard from "./components/patient/PatientDashboard";
import AdminRouteGuard from "./components/AdminRouteGuard";

/**
 * Helpers for route protection
 */
const getCurrentUser = () => {
  const sessionUser = sessionStorage.getItem("currentUser");
  const localUser = localStorage.getItem("currentUser");
  
  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch (e) {
      console.error('Error parsing sessionStorage user:', e);
    }
  }
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch (e) {
      console.error('Error parsing localStorage user:', e);
    }
  }
  return null;
};

// Simple auth wrapper for patient routes
function RequireAuth({ children, role }) {
  const user = getCurrentUser();
  if (!user) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    console.log(`❌ Role mismatch. Required: ${role}, User: ${user.role}`);
    return <Navigate to="/login" replace />;
  }
  console.log('✅ Auth granted for:', user.email);
  return children;
}

// Legacy AdminAuth component (keeping for backward compatibility, but AdminRouteGuard is now primary)
function AdminAuth({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !user.uid) {
        console.log('❌ No user UID for admin check');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking admin status for UID:', user.uid);
        
        // Dynamically import to avoid issues
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase/config');
        
        const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
        
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          console.log('✅ Admin document found:', adminData);
          setIsAdmin(adminData.isAdmin === true);
        } else {
          console.log('❌ No admin document found for user');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('❌ Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Show loading while checking
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900">Checking Admin Access</h3>
        <p className="text-gray-600 mt-2">Verifying your administrator privileges...</p>
        <p className="text-sm text-gray-500 mt-1">User: {user?.email}</p>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    console.log('❌ Access denied: User is not admin');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m12-10a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">
            Your account <span className="font-semibold">{user?.email}</span> does not have administrator privileges.
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

  // Show admin content
  console.log('✅ Admin access granted to:', user.email);
  return children;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient Dashboard */}
          <Route
            path="/patient/dashboard"
            element={
              <RequireAuth role="patient">
                <PatientDashboard />
              </RequireAuth>
            }
          />

          {/* Other patient routes */}
          <Route
            path="/patient/*"
            element={
              <RequireAuth role="patient">
                <PatientPage />
              </RequireAuth>
            }
          />

          {/* SECURE Admin routes - Using the new AdminRouteGuard with multi-layer security */}
          <Route
            path="/admin/*"
            element={
              <AdminRouteGuard>
                <AdminPage />
              </AdminRouteGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}