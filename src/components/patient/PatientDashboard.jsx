import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Upload, 
  BarChart3, 
  ListChecks, 
  Activity,
  LogOut,
  Settings,
  Bell,
  Search,
  TrendingUp // ADDED THIS IMPORT
} from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Import your components using actual paths
import ProfileForm from './ProfileForm';
import LabUploadForm from './LabUploadForm';
import RiskPrediction from './RiskPrediction';
import ProgressTracking from './ProgressTracking'; // ADDED THIS IMPORT
import Recommendations from './Recommendations';
import Monitoring from './Monitoring';

const NeuroMorphicCard = ({ children, className = "" }) => (
  <div className={`bg-[#f0f2f5] rounded-2xl shadow-neuro ${className}`}>
    {children}
  </div>
);

const PatientDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("Profile & Medical Info");
  const [user, setUser] = useState({
    name: "",
    email: "",
    patientId: "",
    uid: ""
  });
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  // Make setSelectedTab available globally for child components
  useEffect(() => {
    window.dashboardSetTab = setSelectedTab;
    
    // Cleanup on unmount
    return () => {
      window.dashboardSetTab = null;
    };
  }, []);

  // Get user data from Firebase Auth and Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get user data from Firestore
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              name: userData.name || userData.fullName || currentUser.displayName || "User",
              email: currentUser.email,
              patientId: userData.patientId || userData.uid || currentUser.uid,
              uid: currentUser.uid
            });
          } else {
            // If no Firestore document, use Auth data
            setUser({
              name: currentUser.displayName || "User",
              email: currentUser.email,
              patientId: currentUser.uid,
              uid: currentUser.uid
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to Auth data
          setUser({
            name: currentUser.displayName || "User",
            email: currentUser.email,
            patientId: currentUser.uid,
            uid: currentUser.uid
          });
        }
      } else {
        // No user logged in, redirect to login
        console.log("No user logged in, redirecting to login...");
        window.location.href = '/login';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Render the correct component based on selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case "Profile & Medical Info":
        return <ProfileForm />;
      case "Lab Test Entry":
        return <LabUploadForm setSelectedTab={setSelectedTab} />;
      case "Risk Prediction":
        return <RiskPrediction />;
      case "Progress Tracking": // ADDED THIS CASE
        return <ProgressTracking />;
      case "Recommendations":
        return <Recommendations />;
      case "Monitoring":
        return <Monitoring />;
      default:
        return (
          <NeuroMorphicCard className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Welcome to Your Dashboard
              </h2>
              <p className="text-gray-600">
                Select a section from the sidebar to view details
              </p>
            </div>
          </NeuroMorphicCard>
        );
    }
  };

  // UPDATED TABS ARRAY - Added "Progress Tracking"
  const tabs = [
    { name: "Profile & Medical Info", icon: <User size={20} /> },
    { name: "Lab Test Entry", icon: <Upload size={20} /> },
    { name: "Risk Prediction", icon: <BarChart3 size={20} /> },
    { name: "Progress Tracking", icon: <TrendingUp size={20} /> }, // NEW TAB
    { name: "Recommendations", icon: <ListChecks size={20} /> },
    { name: "Monitoring", icon: <Activity size={20} /> },
  ];

  // Get user's first name for welcome message
  const getUserFirstName = () => {
    if (!user.name) return 'User';
    return user.name.split(' ')[0];
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  // Get description for selected tab
  const getTabDescription = () => {
    switch (selectedTab) {
      case "Profile & Medical Info":
        return "Manage your personal and medical information";
      case "Lab Test Entry":
        return "Enter your lab values for RA risk prediction";
      case "Risk Prediction":
        return "AI-powered prediction for new patients based on lab results";
      case "Progress Tracking": // ADDED DESCRIPTION
        return "Compare current and previous tests to track disease progression";
      case "Recommendations":
        return "Personalized health recommendations based on your results";
      case "Monitoring":
        return "Track your health metrics over time";
      default:
        return "Manage your health journey with ArthroCare AI";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-gray-200/30"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ArthroCare
              </span>
            </motion.div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search dashboard..."
                  className="w-full pl-12 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.patientId}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
                  {getUserInitial()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="pt-20 flex">
        {/* Sidebar */}
        <motion.aside 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/30 flex flex-col justify-between p-6 h-[calc(100vh-5rem)] sticky top-20"
        >
          <div className="flex flex-col gap-6">
            {/* Welcome Section */}
            <div className="space-y-2">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-gray-900"
              >
                Welcome, {getUserFirstName()}!
              </motion.h2>
              <p className="text-sm text-gray-600">
                Patient ID: {user.patientId.substring(0, 8)}...
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              {tabs.map((tab, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTab(tab.name)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                    selectedTab === tab.name 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-white/50 text-gray-700 hover:bg-white/80 hover:shadow-md'
                  }`}
                >
                  <div className={`${selectedTab === tab.name ? 'text-white' : 'text-blue-600'}`}>
                    {tab.icon}
                  </div>
                  <p className="font-semibold text-sm">{tab.name}</p>
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white/80 hover:shadow-md transition-all duration-300 w-full"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-sm">Settings</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md transition-all duration-300 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Content Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedTab}
                </h1>
                <p className="text-gray-600">
                  {getTabDescription()}
                </p>
              </div>
              
              {/* Quick Stats for Progress Tracking */}
              {selectedTab === "Progress Tracking" && (
                <div className="flex gap-4">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">Compare Tests</p>
                    <p className="text-xs text-blue-600">Track disease progression</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;