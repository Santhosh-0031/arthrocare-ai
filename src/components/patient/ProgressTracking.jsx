import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import CardTransition from '../animations/CardTransition';

const ProgressTracking = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [previousTestData, setPreviousTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    monthsSinceLastTest: '',
    currentAge: '',
    currentGender: '',
    currentESR: '',
    currentCRP: '',
    currentRF: '',
    currentAntiCCP: ''
  });
  
  const [comparisonResult, setComparisonResult] = useState(null);

  // ------------------------------------------------------------------
  // 1. Authentication & Data Loading (Logic)
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadPreviousTestData(user.uid);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadPreviousTestData = async (userId) => {
    try {
      const collections = ['LabInformation', 'labInformation', 'userLabs', 'labResults'];
      let foundData = null;

      for (const collectionName of collections) {
        try {
          const labInfoQuery = query(
            collection(db, collectionName), 
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const querySnapshot = await getDocs(labInfoQuery);
          
          if (!querySnapshot.empty) {
            const latestTest = querySnapshot.docs[0];
            const testData = latestTest.data();
            
            foundData = {
              age: Number(testData.userAge || testData.age),
              gender: testData.userGender || testData.gender,
              ESR: Number(testData.erythrocyteSedimentationRate || testData.ESR),
              CRP: Number(testData.cReactiveProtein || testData.CRP),
              RF: Number(testData.rheumatoidFactor || testData.RF),
              antiCCP: Number(testData.antiCCP || testData.antiCCP),
              createdAt: testData.createdAt,
              documentId: latestTest.id
            };
            break;
          }
        } catch (error) { continue; }
      }

      if (foundData) {
        setPreviousTestData(foundData);
        setFormData(prev => ({ ...prev, currentAge: foundData.age }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // 2. Form Handling & Helper Functions
  // ------------------------------------------------------------------
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'monthsSinceLastTest' && previousTestData?.age) {
      const months = parseFloat(value);
      if (!isNaN(months) && months > 0) {
        const prevAge = parseFloat(previousTestData.age);
        const estimatedAge = (prevAge + (months / 12)).toFixed(1);
        setFormData(prev => ({ ...prev, currentAge: estimatedAge }));
      }
    }
  };

  const normalizeGender = (genderString) => {
    if (!genderString) return 'F';
    const s = String(genderString).toUpperCase();
    return (s.startsWith('M') || s === '1') ? 'M' : 'F';
  };

  // ------------------------------------------------------------------
  // 3. Submit Logic (The Fixed Backend Connection)
  // ------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setComparisonResult(null);
    
    if (!previousTestData || !formData.monthsSinceLastTest) {
      alert("Please ensure all fields are filled.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        monthsSinceLastTest: Number(formData.monthsSinceLastTest),
        previousAge: Number(previousTestData.age),
        previousGender: normalizeGender(previousTestData.gender),
        previousESR: Number(previousTestData.ESR),
        previousCRP: Number(previousTestData.CRP),
        previousRF: Number(previousTestData.RF),
        previousAntiCCP: Number(previousTestData.antiCCP),
        currentAge: Number(formData.currentAge),
        currentGender: normalizeGender(formData.currentGender),
        currentESR: Number(formData.currentESR),
        currentCRP: Number(formData.currentCRP),
        currentRF: Number(formData.currentRF),
        currentAntiCCP: Number(formData.currentAntiCCP)
      };

      // 🔥 CONNECTING TO 127.0.0.1 (FIXED)
      const response = await fetch('http://127.0.0.1:5000/api/compare-ra-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Backend returned HTML instead of JSON. Check server console.");
      }

      if (!response.ok) throw new Error(result.error || "Server Error");

      setComparisonResult(result);

    } catch (error) {
      alert(`Analysis Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      monthsSinceLastTest: '',
      currentAge: previousTestData?.age || '',
      currentGender: '',
      currentESR: '',
      currentCRP: '',
      currentRF: '',
      currentAntiCCP: ''
    });
    setComparisonResult(null);
  };

  // ------------------------------------------------------------------
  // 4. The Original UI Design (Restored)
  // ------------------------------------------------------------------
  
  if (loading) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Your Data...</p>
      </CardTransition>
    );
  }

  if (!previousTestData) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Previous Test Data Found</h3>
        <p className="text-gray-600 mb-6">You need to complete your first lab test entry before using progress tracking.</p>
      </CardTransition>
    );
  }

  return (
    <div className="space-y-6">
      <CardTransition className="bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">RA Progress Tracking</h2>
        <p className="text-gray-600 mb-6">
          Compare your current lab results with previous tests to track Rheumatoid Arthritis progression over time.
          Our ML model analyzes changes in biomarkers to provide clinical insights.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Time Information (Blue Box) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">⏰ Time Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How many months since your last test? *
                </label>
                <input
                  type="number"
                  value={formData.monthsSinceLastTest}
                  onChange={(e) => handleInputChange('monthsSinceLastTest', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 6"
                  required
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">We'll automatically estimate your current age</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Test Date</label>
                <input
                  type="text"
                  value={previousTestData.createdAt ? new Date(previousTestData.createdAt).toLocaleDateString() : 'Unknown'}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 2. Previous Test Results (Gray Box - Auto Filled) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">📊 Previous Test Results</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Auto-filled from your records</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age at First Test</label>
                <input type="text" value={previousTestData.age} readOnly className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <input type="text" value={previousTestData.gender} readOnly className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ESR (mm/hr)</label>
                <input type="text" value={previousTestData.ESR} readOnly className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CRP (mg/L)</label>
                <input type="text" value={previousTestData.CRP} readOnly className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RF (IU/mL)</label>
                <input type="text" value={previousTestData.RF} readOnly className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anti-CCP (U/mL)</label>
                <input type="text" value={previousTestData.antiCCP} readOnly className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* 3. Current Test Results (Green Box - Manual Entry) */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-900">🩺 Current Test Results</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Enter your latest results</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Age *</label>
                <input type="number" step="0.1" value={formData.currentAge} onChange={(e) => handleInputChange('currentAge', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select value={formData.currentGender} onChange={(e) => handleInputChange('currentGender', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">ESR (mm/hr) *</label><input type="number" step="0.1" value={formData.currentESR} onChange={(e) => handleInputChange('currentESR', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">CRP (mg/L) *</label><input type="number" step="0.1" value={formData.currentCRP} onChange={(e) => handleInputChange('currentCRP', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">RF (IU/mL) *</label><input type="number" step="0.1" value={formData.currentRF} onChange={(e) => handleInputChange('currentRF', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Anti-CCP (U/mL) *</label><input type="number" step="0.1" value={formData.currentAntiCCP} onChange={(e) => handleInputChange('currentAntiCCP', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required /></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <button type="button" onClick={clearForm} className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">Clear Form</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? 'Analyzing with ML Model...' : 'Compare Results with AI'}
            </button>
          </div>
        </form>
      </CardTransition>

      {/* COMPARISON RESULTS */}
      {comparisonResult && (
        <CardTransition className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">ML Analysis Results</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              comparisonResult.riskTrend === 'Improved' ? 'bg-green-100 text-green-800' :
              comparisonResult.riskTrend === 'Worsened' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {comparisonResult.riskTrend}
            </span>
          </div>
          
          {/* Probability Boxes (Blue vs Green) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">First Appointment</h4>
              <p className="text-4xl font-bold text-blue-600 mb-2">{comparisonResult.previousProbability}%</p>
              <p className="text-sm text-blue-700">RA Probability</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
              <h4 className="text-lg font-semibold text-green-900 mb-2">Current Appointment</h4>
              <p className="text-4xl font-bold text-green-600 mb-2">{comparisonResult.currentProbability}%</p>
              <p className="text-sm text-green-700">RA Probability</p>
            </div>
          </div>

          {/* Change Pill */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${
              comparisonResult.probabilityChange > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              <span className="font-semibold">
                {comparisonResult.probabilityChange > 0 ? '↑' : '↓'} {Math.abs(comparisonResult.probabilityChange)}% change
              </span>
              <span className="ml-2 text-sm">over {comparisonResult.monthsBetweenTests} months</span>
            </div>
          </div>

          {/* Biomarkers */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Biomarker Changes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisonResult.biomarkerChanges.map((change, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="font-medium text-gray-700">{change.name}:</span>
                  <div className="text-right">
                    <span className="text-gray-900 font-mono">{change.change}</span>
                    <span className={`block text-xs ${change.percentChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {change.percentChange > 0 ? '+' : ''}{change.percentChange}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interpretation (Yellow) */}
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-6">
            <h4 className="text-lg font-semibold text-yellow-900 mb-3">🧾 Clinical Interpretation</h4>
            <p className="text-gray-700 leading-relaxed">{comparisonResult.interpretation}</p>
          </div>

          {/* Summary (Purple) */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <h4 className="text-lg font-semibold text-purple-900 mb-3">🏥 Final Summary Report</h4>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">{comparisonResult.summary}</div>
          </div>

        </CardTransition>
      )}
    </div>
  );
};

export default ProgressTracking;