import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import CardTransition from '../animations/CardTransition';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  TestTube, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  User,
  Stethoscope,
  Heart
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const Monitoring = () => {
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('risk_score');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        loadPredictionHistory(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadPredictionHistory = async (userId) => {
    try {
      setLoading(true);
      console.log("📥 Loading ALL lab data for user:", userId);

      const labQuery = query(
        collection(db, "LabInformation"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(labQuery);

      if (snapshot.empty) {
        console.log("No lab data found for monitoring");
        setPredictionHistory([]);
        setLoading(false);
        return;
      }

      const history = [];
      
      // Process each lab entry with actual prediction
      for (const doc of snapshot.docs) {
        const labData = doc.data();
        
        try {
          // Prepare payload with all 6 factors
          const payload = {
            age: parseFloat(labData.userAge),
            gender: labData.userGender,
            rheumatoidFactor: parseFloat(labData.rheumatoidFactor),
            antiCCP: parseFloat(labData.antiCCP),
            cReactiveProtein: parseFloat(labData.cReactiveProtein),
            erythrocyteSedimentationRate: parseFloat(labData.erythrocyteSedimentationRate)
          };

          console.log("🚀 Sending prediction request for:", payload);

          const backendURL = import.meta.env.VITE_BACKEND_URL;
          const response = await fetch(`${backendURL}/api/predict-ra-risk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const prediction = await response.json();
            
            history.push({
              id: doc.id,
              date: new Date(labData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              timestamp: new Date(labData.createdAt),
              risk_score: prediction.risk_score,
              risk_level: prediction.risk_level,
              risk_probability: prediction.risk_probability,
              binary_prediction: prediction.binary_prediction,
              // All 6 factors used for prediction
              factors: {
                age: payload.age,
                gender: payload.gender,
                rheumatoidFactor: payload.rheumatoidFactor,
                antiCCP: payload.antiCCP,
                cReactiveProtein: payload.cReactiveProtein,
                erythrocyteSedimentationRate: payload.erythrocyteSedimentationRate
              },
              recommendations: prediction.recommendations,
              full_prediction: prediction
            });

            console.log("✅ Prediction added to history:", prediction.risk_score);
          } else {
            console.error("❌ Prediction failed for lab entry:", doc.id);
          }
        } catch (error) {
          console.error("❌ Error processing lab entry:", error);
        }
      }

      console.log("✅ Final prediction history:", history);
      setPredictionHistory(history);
    } catch (error) {
      console.error("❌ Error loading prediction history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = predictionHistory.filter(entry => {
    const now = new Date();
    const entryDate = new Date(entry.timestamp);
    
    switch (timeRange) {
      case 'week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= oneWeekAgo;
      case 'month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= oneMonthAgo;
      default:
        return true;
    }
  });

  // Risk Score Chart Data - USING REAL PREDICTION DATA
  const riskScoreChartData = {
    labels: filteredHistory.map(entry => entry.date),
    datasets: [
      {
        label: 'RA Risk Score (%)',
        data: filteredHistory.map(entry => entry.risk_score),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: filteredHistory.map(entry => 
          entry.risk_level === 'High' ? 'rgb(239, 68, 68)' :
          entry.risk_level === 'Moderate' ? 'rgb(249, 115, 22)' :
          entry.risk_level === 'Low' ? 'rgb(234, 179, 8)' :
          'rgb(34, 197, 94)'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  // Lab Values Chart Data - USING REAL LAB VALUES
  const labValuesChartData = {
    labels: filteredHistory.map(entry => entry.date),
    datasets: [
      {
        label: 'Rheumatoid Factor (RF)',
        data: filteredHistory.map(entry => entry.factors.rheumatoidFactor),
        borderColor: 'rgb(139, 69, 255)',
        backgroundColor: 'rgba(139, 69, 255, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Anti-CCP',
        data: filteredHistory.map(entry => entry.factors.antiCCP),
        borderColor: 'rgb(255, 69, 139)',
        backgroundColor: 'rgba(255, 69, 139, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'C-Reactive Protein (CRP)',
        data: filteredHistory.map(entry => entry.factors.cReactiveProtein),
        borderColor: 'rgb(69, 139, 255)',
        backgroundColor: 'rgba(69, 139, 255, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'ESR',
        data: filteredHistory.map(entry => entry.factors.erythrocyteSedimentationRate),
        borderColor: 'rgb(255, 165, 69)',
        backgroundColor: 'rgba(255, 165, 69, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      }
    ]
  };

  // Risk Level Distribution - USING REAL RISK LEVELS
  const riskLevelDistribution = {
    labels: ['Very Low', 'Low', 'Moderate', 'High'],
    datasets: [
      {
        label: 'Risk Level Distribution',
        data: [
          filteredHistory.filter(entry => entry.risk_level === 'Very Low').length,
          filteredHistory.filter(entry => entry.risk_level === 'Low').length,
          filteredHistory.filter(entry => entry.risk_level === 'Moderate').length,
          filteredHistory.filter(entry => entry.risk_level === 'High').length
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Risk Score (%)'
        }
      }
    }
  };

  const labChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Lab Values'
        }
      }
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'Very Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'Very Low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Low': return <CheckCircle className="w-4 h-4 text-yellow-600" />;
      case 'Moderate': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'High': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const refreshData = () => {
    if (currentUser) {
      loadPredictionHistory(currentUser.uid);
    }
  };

  if (loading) {
    return (
      <CardTransition className="bg-white p-8 rounded-2xl shadow-lg border text-center">
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-xl font-semibold">Loading Monitoring Data</h3>
          <p className="text-gray-600 mt-2">Processing your historical predictions...</p>
        </div>
      </CardTransition>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RA Risk Monitoring</h1>
          <p className="text-gray-600">Track your RA risk predictions based on 6 clinical factors</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Statistics Cards with REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardTransition className="bg-white p-4 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900">{predictionHistory.length}</p>
            </div>
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
        </CardTransition>

        <CardTransition className="bg-white p-4 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictionHistory[0]?.risk_score || 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </CardTransition>

        <CardTransition className="bg-white p-4 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Level</p>
              <p className="text-xl font-bold text-gray-900">
                {predictionHistory[0]?.risk_level || 'N/A'}
              </p>
            </div>
            {getRiskIcon(predictionHistory[0]?.risk_level)}
          </div>
        </CardTransition>

        <CardTransition className="bg-white p-4 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Prediction</p>
              <p className="text-lg font-bold text-gray-900">
                {predictionHistory[0]?.date || 'N/A'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </CardTransition>
      </div>

      {/* Filters */}
      <CardTransition className="bg-white p-4 rounded-xl shadow-lg border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
          </div>
          {['week', 'month', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-medium text-gray-700">View:</span>
          </div>
          {['risk_score', 'lab_values'].map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric === 'risk_score' ? 'Risk Score' : 'Lab Values'}
            </button>
          ))}
        </div>
      </CardTransition>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <CardTransition className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {selectedMetric === 'risk_score' ? 'RA Risk Score Trend' : 'Lab Values Trend'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {selectedMetric === 'risk_score' 
              ? 'Based on AI analysis of your 6 clinical factors' 
              : 'Actual lab values used for risk prediction'
            }
          </p>
          <div className="h-80">
            {selectedMetric === 'risk_score' ? (
              <Line data={riskScoreChartData} options={chartOptions} />
            ) : (
              <Line data={labValuesChartData} options={labChartOptions} />
            )}
          </div>
        </CardTransition>

        {/* Risk Distribution */}
        <CardTransition className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Risk Level Distribution
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Distribution of your historical risk levels
          </p>
          <div className="h-80">
            <Bar 
              data={riskLevelDistribution} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }} 
            />
          </div>
        </CardTransition>
      </div>

      {/* Detailed Prediction History */}
      <CardTransition className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Detailed Prediction History
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          All predictions based on your actual lab values and personal factors
        </p>
        
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No prediction data available for the selected time range.</p>
            <p className="text-sm text-gray-500 mt-2">Submit lab results to see your monitoring data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Risk Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Probability</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Age</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Gender</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">RF</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Anti-CCP</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">CRP</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ESR</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.date}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {entry.risk_score}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelColor(entry.risk_level)}`}>
                        {getRiskIcon(entry.risk_level)}
                        <span className="ml-1">{entry.risk_level}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.risk_probability}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.factors.age}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.factors.gender}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.factors.rheumatoidFactor}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.factors.antiCCP}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.factors.cReactiveProtein}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.factors.erythrocyteSedimentationRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardTransition>

      {/* Factors Information */}
      <CardTransition className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center gap-2">
          <User className="w-5 h-5" />
          Prediction Factors Used
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Personal Factors:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Age</li>
              <li>Gender</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Lab Markers:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Rheumatoid Factor (RF)</li>
              <li>Anti-CCP Antibodies</li>
              <li>C-Reactive Protein (CRP)</li>
              <li>Erythrocyte Sedimentation Rate (ESR)</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-blue-700 mt-3">
          All 6 factors are processed by the AI model to generate your RA risk score.
        </p>
      </CardTransition>
    </div>
  );
};

export default Monitoring;