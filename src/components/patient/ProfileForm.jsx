import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, getDocs, query, where, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import CardTransition from "../animations/CardTransition";

const ProfileForm = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    age: "",
    email: "",
    phone: "",
    gender: "",
    bmi: "",
    familyHistory: "",
    medicalHistory: "",
    smoking: "No",
    alcohol: "No",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          email: user.email
        }));
        await loadUserProfile(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      setLoading(true);
      
      const collections = ['personalInformation', 'users', 'userProfiles', 'profiles'];
      
      for (const collectionName of collections) {
        try {
          const userDocRef = doc(db, collectionName, userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            setFormData(prev => ({
              ...prev,
              ...userData,
              email: prev.email || userData.email
            }));
            break;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "dob") {
      const age = calculateAge(value);
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        age: age 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("⚠️ Please log in to save your profile.");
      return;
    }

    if (!formData.name.trim()) {
      alert("⚠️ Please enter your name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userDocRef = doc(db, "personalInformation", currentUser.uid);

      const profileData = {
        ...formData,
        userId: currentUser.uid,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      await setDoc(userDocRef, profileData, { merge: true });

      alert("✅ Profile saved successfully in Firebase!");

      if (window.dashboardSetTab) {
        window.dashboardSetTab("Lab Test Entry");
      }

    } catch (error) {
      let errorMessage = `⚠️ Error saving profile: ${error.message}`;
      
      if (error.code === 'permission-denied') {
        errorMessage += "\n\nThis is usually due to:\n• Firestore security rules\n• Document ID mismatch\n• Missing userId in data";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAlternative = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("⚠️ Please log in to save your profile.");
      return;
    }

    if (!formData.name.trim()) {
      alert("⚠️ Please enter your name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const collections = ['personalInformation', 'users', 'userProfiles', 'profiles'];
      let savedSuccessfully = false;
      let lastError = null;

      const profileData = {
        ...formData,
        userId: currentUser.uid,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      for (const collectionName of collections) {
        try {
          const userDocRef = doc(db, collectionName, currentUser.uid);
          await setDoc(userDocRef, profileData, { merge: true });
          savedSuccessfully = true;
          break;
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!savedSuccessfully) {
        throw lastError || new Error('Failed to save to any collection');
      }

      alert("✅ Profile saved successfully!");

      if (window.dashboardSetTab) {
        window.dashboardSetTab("Lab Test Entry");
      }

    } catch (error) {
      alert(`⚠️ Error saving profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      name: "",
      dob: "",
      age: "",
      email: currentUser?.email || "",
      phone: "",
      gender: "",
      bmi: "",
      familyHistory: "",
      medicalHistory: "",
      smoking: "No",
      alcohol: "No",
    });
  };

  if (!currentUser) {
    return (
      <CardTransition className="bg-white/90 p-8 rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Please Log In
          </h3>
          <p className="text-gray-600">
            You need to be logged in to save your profile information.
          </p>
        </div>
      </CardTransition>
    );
  }

  if (loading) {
    return (
      <CardTransition className="bg-white/90 p-8 rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </CardTransition>
    );
  }

  return (
    <CardTransition className="bg-white/90 p-8 rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-indigo-700">
          Profile & Medical Information
        </h2>
        <div className="text-sm text-gray-500">
          User ID: <span className="font-mono text-xs">{currentUser.uid.substring(0, 8)}...</span>
        </div>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={handleSubmitAlternative} 
      >

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            type="text"
            name="age"
            value={formData.age}
            readOnly
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Auto-calculated from DOB"
          />
          <p className="text-xs text-gray-500 mt-1">
            Automatically calculated from date of birth
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            BMI
          </label>
          <input
            type="text"
            name="bmi"
            value={formData.bmi}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="e.g., 22.5"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Family History
          </label>
          <textarea
            name="familyHistory"
            value={formData.familyHistory}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Mention relevant family medical history..."
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Medical History
          </label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Mention any previous illnesses, surgeries, etc..."
          />
        </div>

        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Smoking
            </label>
            <select
              name="smoking"
              value={formData.smoking}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alcohol
            </label>
            <select
              name="alcohol"
              value={formData.alcohol}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleClearForm}
            className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-transform transform hover:scale-105"
          >
            Clear Form
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving to Firebase...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </form>

      {/* DEBUG INFO REMOVED AS REQUESTED */}

    </CardTransition>
  );
};

export default ProfileForm;
