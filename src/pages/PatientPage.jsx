// src/pages/PatientPage.jsx
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import ProfileForm from '../components/patient/ProfileForm';
import LabUploadForm from '../components/patient/LabUploadForm';
import RiskPrediction from '../components/patient/RiskPrediction';
import Recommendations from '../components/patient/Recommendations';
import Monitoring from '../components/patient/Monitoring';
import { motion } from 'framer-motion';

const sidebarNav = [
  { path: 'profile', name: 'Profile & Medical Info' },
  { path: 'lab-tests', name: 'Lab Test Upload' },
  { path: 'risk-prediction', name: 'Risk Prediction' },
  { path: 'recommendations', name: 'Recommendations' },
  { path: 'monitoring', name: 'Monitoring' },
];

const PatientPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Placeholder for logout logic
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-light-gray">
      <Sidebar
        navItems={sidebarNav}
        userType="patient"
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header title="Patient Dashboard" onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-8">
          <Routes>
            <Route path="profile" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ProfileForm /></motion.div>} />
            <Route path="lab-tests" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><LabUploadForm /></motion.div>} />
            <Route path="risk-prediction" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><RiskPrediction /></motion.div>} />
            <Route path="recommendations" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Recommendations /></motion.div>} />
            <Route path="monitoring" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Monitoring /></motion.div>} />
            <Route path="/" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2 className="text-3xl font-semibold mb-6 text-primary-blue">Welcome, Patient!</h2><p>Select an option from the sidebar to get started.</p></motion.div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default PatientPage;