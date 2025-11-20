import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  Stethoscope, 
  Heart, 
  RefreshCw,
  User,
  TestTube,
  Calendar,
  Activity as ActivityIcon,
  Shield
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from '../animations/CardTransition';

const backendURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const RiskPrediction = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLabData, setHasLabData] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        console.log("✅ Authenticated user:", user.uid);
      } else {
        setError('Please log in to view predictions.');
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) loadLatestLabDataAndPredict();
  }, [currentUser]);

  const loadLatestLabDataAndPredict = async () => {
    try {
      setLoading(true);
      setError('');

      if (!currentUser) {
        setError('Please log in first.');
        setLoading(false);
        return;
      }

      console.log("📥 Fetching lab data for:", currentUser.uid);
      const labQuery = query(
        collection(db, "LabInformation"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(labQuery);

      if (snapshot.empty) {
        setError('No lab data found. Please submit your lab test results.');
        setHasLabData(false);
        setLoading(false);
        return;
      }

      const labData = snapshot.docs[0].data();
      setHasLabData(true);

      const payload = {
        age: labData.userAge,
        gender: labData.userGender,
        rheumatoidFactor: labData.rheumatoidFactor,
        antiCCP: labData.antiCCP,
        cReactiveProtein: labData.cReactiveProtein,
        erythrocyteSedimentationRate: labData.erythrocyteSedimentationRate
      };

      console.log("🚀 Sending payload:", payload);
      console.log("🌐 Backend URL:", `${backendURL}/api/predict-ra-risk`);

      const response = await fetch(`${backendURL}/api/predict-ra-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      console.log("✅ Prediction received:", result);
      setPredictionData(result);
    } catch (err) {
      console.error("❌ Prediction error:", err);
      setError(err.message || 'Unable to load prediction.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => ({
    "Very Low": "from-green-500 to-green-600",
    "Low": "from-yellow-500 to-yellow-600",
    "Moderate": "from-orange-500 to-orange-600",
    "High": "from-red-500 to-red-600"
  }[risk] || "from-gray-500 to-gray-600");

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'Very Low': return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'Low': return <CheckCircle className="w-8 h-8 text-yellow-600" />;
      case 'Moderate': return <AlertCircle className="w-8 h-8 text-orange-600" />;
      case 'High': return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default: return <Activity className="w-8 h-8 text-gray-600" />;
    }
  };

  const getRiskBorderColor = (risk) => ({
    "Very Low": "border-green-200",
    "Low": "border-yellow-200",
    "Moderate": "border-orange-200",
    "High": "border-red-200"
  }[risk] || "border-gray-200");

  const getRiskBgColor = (risk) => ({
    "Very Low": "bg-green-50",
    "Low": "bg-yellow-50",
    "Moderate": "bg-orange-50",
    "High": "bg-red-50"
  }[risk] || "bg-gray-50");

  if (loading) return (
    <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border text-center">
      <div className="flex flex-col items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-xl font-semibold">Analyzing Your Risk</h3>
        <p className="text-gray-600 mt-2">Processing your lab results with AI...</p>
      </div>
    </CardTransition>
  );

  if (error) return (
    <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-red-700 mb-2">Unable to Load Prediction</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={loadLatestLabDataAndPredict}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
      {error.includes('5000') && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 mt-3 rounded-lg">
          💡 Make sure backend is running:<br />
          <code className="text-xs bg-gray-200 px-2 py-1 rounded">python app.py</code>
        </div>
      )}
    </CardTransition>
  );

  if (!hasLabData && !predictionData)
    return (
      <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border text-center">
        <Stethoscope className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold">No Lab Data Found</h3>
        <p className="text-gray-600 mb-6">Submit your test results to get a prediction.</p>
      </CardTransition>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RA Risk Prediction</h1>
        <p className="text-gray-600">AI-powered analysis of your lab results</p>
      </div>

      {/* Main Risk Card */}
      <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Rheumatoid Arthritis Risk</h2>
          <p className="text-gray-600">AI prediction based on your lab data</p>
        </div>

        {/* Risk Level */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`p-8 rounded-full bg-gradient-to-r ${getRiskColor(predictionData.risk_level)} w-48 h-48 flex items-center justify-center mb-6 shadow-lg`}
          >
            <div className="text-center text-white">
              {getRiskIcon(predictionData.risk_level)}
              <div className="text-2xl font-bold mt-2">{predictionData.risk_level}</div>
              <div className="text-sm opacity-90">{predictionData.risk_score}% Risk</div>
            </div>
          </motion.div>

          {/* Probability Score */}
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">
              Probability: <strong>{predictionData.risk_probability}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Binary Prediction: <strong>{predictionData.binary_prediction === 1 ? 'RA Positive' : 'RA Negative'}</strong>
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className={`border-l-4 ${getRiskBorderColor(predictionData.risk_level)} ${getRiskBgColor(predictionData.risk_level)} p-6 rounded-lg mb-6`}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Assessment & Recommendations
          </h3>
          <div className="space-y-3">
            {predictionData.recommendations.map((recommendation, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-gray-700 leading-relaxed"
              >
                {recommendation}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Lab Values Used */}
        <CardTransition className="bg-gray-50 p-6 rounded-xl border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-600" />
            Lab Values Analyzed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-gray-600">Age</span>
              <span className="font-semibold">{predictionData.factors_analyzed.age}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-gray-600">Gender</span>
              <span className="font-semibold">{predictionData.factors_analyzed.gender}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-gray-600">Rheumatoid Factor</span>
              <span className="font-semibold">{predictionData.factors_analyzed.rheumatoid_factor}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-gray-600">Anti-CCP</span>
              <span className="font-semibold">{predictionData.factors_analyzed.anti_ccp}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-gray-600">C-Reactive Protein</span>
              <span className="font-semibold">{predictionData.factors_analyzed.c_reactive_protein}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-gray-600">ESR</span>
              <span className="font-semibold">{predictionData.factors_analyzed.esr}</span>
            </div>
          </div>
        </CardTransition>

        {/* ❌ MODEL INFORMATION REMOVED AS YOU REQUESTED */}

        {/* Refresh Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={loadLatestLabDataAndPredict}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Prediction
          </button>
        </div>
      </CardTransition>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Risk Interpretation Guide */}
        <CardTransition className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-green-600" />
            Risk Level Guide
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span>Very Low (0-40%)</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span>Low (40-65%)</span>
              <CheckCircle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <span>Moderate (65-85%)</span>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span>High (85-100%)</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </CardTransition>

        {/* Next Steps */}
        <CardTransition className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Recommended Next Steps
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Consult with a rheumatologist for clinical evaluation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Monitor symptoms and lab values regularly
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Consider lifestyle modifications if at moderate risk
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Follow up with additional testing if recommended
            </li>
          </ul>
        </CardTransition>

      </div>
    </div>
  );
};

export default RiskPrediction;
