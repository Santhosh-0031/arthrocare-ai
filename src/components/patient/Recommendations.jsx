import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Apple, 
  Dumbbell, 
  Heart, 
  Moon, 
  Utensils,
  Activity,
  Sun,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  Calendar
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from '../animations/CardTransition';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        loadUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      // Load profile data
      const profileQuery = query(
        collection(db, "personalInformation"), 
        where("userId", "==", userId)
      );
      const profileSnapshot = await getDocs(profileQuery);
      
      let profileData = {};
      if (!profileSnapshot.empty) {
        profileData = profileSnapshot.docs[0].data();
      }

      // Load latest lab data
      const labQuery = query(
        collection(db, "LabInformation"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const labSnapshot = await getDocs(labQuery);
      
      let labData = {};
      if (!labSnapshot.empty) {
        labData = labSnapshot.docs[0].data();
      }

      setUserData({ ...profileData, ...labData });
      
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateRecommendations = async () => {
    if (!currentUser) {
      setError('Please log in to generate recommendations.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for recommendations API
      const requestData = {
        age: userData.age || 30,
        gender: userData.gender || 'Male',
        smokingStatus: userData.smoking || 'Never',
        drinkingStatus: userData.alcohol || 'Never',
        rheumatoidArthritis: userData.rheumatoidArthritis || 0,
        ESR: userData.erythrocyteSedimentationRate || userData.ESR || 0,
        CRP: userData.cReactiveProtein || userData.CRP || 0,
        RF: userData.rheumatoidFactor || userData.RF || 0,
        AntiCCP: userData.antiCCP || 0,
        weight: userData.weight || null,
        vegetarian: userData.vegetarian || false
      };

      console.log("📤 Sending data to recommendations API:", requestData);

      const response = await fetch('http://localhost:5001/api/generate-recommendations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Recommendations received:", result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setRecommendations(result);
      
    } catch (err) {
      console.error("❌ Error generating recommendations:", err);
      setError(err.message || 'Failed to generate recommendations. Make sure the recommendations backend is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Severe - Urgent': 'bg-red-100 text-red-800 border-red-200',
      'Severe': 'bg-orange-100 text-orange-800 border-orange-200',
      'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Borderline': 'bg-blue-100 text-blue-800 border-blue-200',
      'Low/Normal': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSectionIcon = (section) => {
    const icons = {
      'diet': <Utensils className="w-6 h-6" />,
      'exercise': <Activity className="w-6 h-6" />,
      'lifestyle': <Sun className="w-6 h-6" />,
      'mentalWellness': <Brain className="w-6 h-6" />
    };
    return icons[section] || <Sparkles className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border text-center">
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Personalized Plan</h3>
          <p className="text-gray-600">Analyzing your health profile and creating tailored recommendations...</p>
        </div>
      </CardTransition>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalized RA Recommendations</h1>
        <p className="text-gray-600">AI-powered lifestyle guidance tailored to your health profile</p>
      </div>

      {/* Action Card */}
      <CardTransition className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl shadow-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generate Your Personalized Plan</h2>
              <p className="text-gray-600">Get customized diet, exercise, and lifestyle recommendations based on your health data</p>
            </div>
          </div>
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? 'Generating...' : 'Generate Recommendations'}
          </button>
        </div>
      </CardTransition>

      {/* Error Message */}
      {error && (
        <CardTransition className="bg-red-50 p-6 rounded-2xl border border-red-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Unable to Generate Recommendations</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </CardTransition>
      )}

      {/* Recommendations Display */}
      {recommendations && (
        <div className="space-y-6">
          {/* Patient Summary */}
          <CardTransition className="bg-white p-6 rounded-2xl shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Health Summary</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getSeverityColor(recommendations.patientSummary.severity)}`}>
                {recommendations.patientSummary.severity}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-semibold text-gray-900">{recommendations.patientSummary.age}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-lg font-semibold text-gray-900">{recommendations.patientSummary.gender}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="text-lg font-semibold text-gray-900">{recommendations.patientSummary.riskScore}%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">ML Probability</p>
                <p className="text-lg font-semibold text-gray-900">
                  {recommendations.patientSummary.modelProbability ? 
                    `${(recommendations.patientSummary.modelProbability * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardTransition>

          {/* Recommendations Sections */}
          {Object.entries(recommendations.recommendations).map(([sectionKey, sectionData]) => (
            <CardTransition key={sectionKey} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    {getSectionIcon(sectionKey)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{sectionData.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {sectionData.sections.length} sections • Click to {expandedSections[sectionKey] ? 'collapse' : 'expand'}
                    </p>
                  </div>
                </div>
                {expandedSections[sectionKey] ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {expandedSections[sectionKey] && (
                <div className="p-6 border-t border-gray-100 space-y-6">
                  {sectionData.sections.map((subsection, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 p-4 rounded-xl"
                    >
                      <h4 className="font-semibold text-gray-900 mb-3 text-lg">{subsection.title}</h4>
                      <ul className="space-y-2">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3 text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardTransition>
          ))}

          {/* Key Messages */}
          <CardTransition className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">Important Notes</h3>
                <ul className="space-y-2 text-blue-800">
                  {recommendations.keyMessages.map((message, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardTransition>

          {/* Regenerate Button */}
          <div className="text-center">
            <button
              onClick={generateRecommendations}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              Regenerate Recommendations
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!recommendations && !loading && !error && (
        <CardTransition className="bg-white p-12 rounded-2xl shadow-lg border text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Personalized Plan Awaits</h3>
            <p className="text-gray-600 mb-6">
              Click the button above to generate customized recommendations based on your health profile, 
              lab results, and lifestyle factors.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                <span>Diet Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>Exercise Routines</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Lifestyle Tips</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>Mental Wellness</span>
              </div>
            </div>
          </div>
        </CardTransition>
      )}
    </div>
  );
};

export default Recommendations;