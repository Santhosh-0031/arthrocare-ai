import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Shield,
  Eye,
  User,
  Activity
} from "lucide-react";
import { collection, doc, getDocs, query, where, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from "../animations/CardTransition";

const LabUploadForm = ({ setSelectedTab }) => {
  const [labValues, setLabValues] = useState({
    RF: "",
    "Anti-CCP": "",
    CRP: "",
    ESR: ""
  });

  const [userData, setUserData] = useState({
    age: "",
    gender: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserProfileData(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfileData = async (userId) => {
    try {
      const personalInfoQuery = query(
        collection(db, "personalInformation"), 
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(personalInfoQuery);
      
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileData = profileDoc.data();
        
        setUserData({
          age: profileData.age || "",
          gender: profileData.gender || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const handleInputChange = (key, value) => {
    setLabValues(prev => ({ ...prev, [key]: value }));
  };

  const saveLabDataToFirebase = async () => {
    try {
      if (!currentUser) throw new Error("User not authenticated");

      if (!userData.age || !userData.gender) {
        throw new Error("Please complete your profile first with age and gender");
      }

      const emptyLabFields = Object.entries(labValues)
        .filter(([key, value]) => !value.trim())
        .map(([key]) => key);

      if (emptyLabFields.length > 0) {
        throw new Error(`Please fill all lab values: ${emptyLabFields.join(", ")}`);
      }

      const docName = `user_${currentUser.uid}_lab_${Date.now()}`;

      const labData = {
        userAge: userData.age,
        userGender: userData.gender,
        userId: currentUser.uid,
        rheumatoidFactor: labValues.RF,
        antiCCP: labValues["Anti-CCP"],
        cReactiveProtein: labValues.CRP,
        erythrocyteSedimentationRate: labValues.ESR,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        documentName: docName
      };

      const labInfoRef = doc(collection(db, "LabInformation"), docName);

      await setDoc(labInfoRef, labData);

      return true;

    } catch (error) {
      console.error("Error saving lab data:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");

    try {
      await saveLabDataToFirebase();
      
      setSubmissionSuccess(true);
      
      setLabValues({
        RF: "",
        "Anti-CCP": "",
        CRP: "",
        ESR: ""
      });

    } catch (error) {
      setError("Failed to save lab data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setLabValues({
      RF: "",
      "Anti-CCP": "",
      CRP: "",
      ESR: ""
    });
    setSubmissionSuccess(false);
    setError("");
  };

  const labTests = [
    { key: "RF", label: "Rheumatoid Factor", unit: "IU/mL", normalRange: "0-14 IU/mL" },
    { key: "Anti-CCP", label: "Anti-CCP Antibodies", unit: "U/mL", normalRange: "<20 U/mL" },
    { key: "CRP", label: "C-Reactive Protein", unit: "mg/L", normalRange: "<3.0 mg/L" },
    { key: "ESR", label: "Erythrocyte Sedimentation Rate", unit: "mm/hr", normalRange: "0-20 mm/hr" }
  ];

  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2"></h1>
          <p className="text-gray-600"></p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 text-sm font-medium">
              {error}
            </span>
          </motion.div>
        )}

        {submissionSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 text-sm font-medium">
              ✅ All 6 values saved successfully! You can now view your risk prediction.
            </span>
          </motion.div>
        )}

        <CardTransition className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Patient Information (Auto-filled)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  Age *
                </label>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Auto-filled
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={userData.age}
                    readOnly
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl cursor-not-allowed"
                    placeholder="Loading from profile..."
                  />
                </div>
                <p className="text-xs text-blue-600">
                  {userData.age ? "✅ Loaded from your profile" : "Please complete your profile first"}
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  Gender *
                </label>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Auto-filled
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={userData.gender}
                    readOnly
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl cursor-not-allowed"
                    placeholder="Loading from profile..."
                  />
                </div>
                <p className="text-xs text-blue-600">
                  {userData.gender ? "✅ Loaded from your profile" : "Please complete your profile first"}
                </p>
              </div>
            </div>

          </div>
        </CardTransition>

        <CardTransition className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TestTube className="w-6 h-6 text-purple-600" />
            Lab Test Values (Manual Entry)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labTests.map((test) => (
              <div key={test.key} className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    {test.label} *
                  </label>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={labValues[test.key]}
                      onChange={(e) => handleInputChange(test.key, e.target.value)}
                      placeholder={`Enter ${test.unit}`}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                      required
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      {test.unit}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Normal range: {test.normalRange}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardTransition>

        <div className="flex justify-between gap-4">
          <div className="flex gap-4">

            <motion.button
              type="button"
              onClick={handleClearForm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-4 bg-gray-500 text-white font-semibold rounded-xl shadow-lg flex items-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Clear Lab Values
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={loading || !userData.age || !userData.gender}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {loading ? "Saving..." : "Save All 6 Values"}
            </motion.button>

          </div>

          <motion.button
            type="button"
            onClick={() => setSelectedTab("Risk Prediction")}
            disabled={!submissionSuccess}
            whileHover={{ scale: submissionSuccess ? 1.02 : 1 }}
            whileTap={{ scale: submissionSuccess ? 0.98 : 1 }}
            className={`px-8 py-4 font-semibold rounded-xl flex items-center gap-3 ${
              submissionSuccess 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Activity className="w-5 h-5" />
            {submissionSuccess ? "View Risk Prediction" : "Save Data First"}
          </motion.button>

        </div>
      </form>

    </div>
  );
};

export default LabUploadForm;
