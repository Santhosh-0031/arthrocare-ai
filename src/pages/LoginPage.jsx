import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const NeuroMorphicCard = ({ children, className = "" }) => (
  <div className={`bg-[#f0f2f5] rounded-2xl shadow-neuro ${className}`}>
    {children}
  </div>
);

const FloatingElement = ({ delay = 0, children, className = "" }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Starting login process...");

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ User signed in successfully:", user.uid);

      let userData = {};
      let docName = "";
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          userData = userDoc.data();
          docName = userData.docName || user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
          console.log("✅ User data retrieved from Firestore");
        } else {
          console.log("⚠️ No user data found in Firestore, using basic info");
          userData = {
            name: user.displayName || "User",
            email: user.email,
            role: "patient"
          };
          docName = user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
        }
      } catch (firestoreError) {
        console.error("❌ Firestore error:", firestoreError);
        userData = {
          name: user.displayName || "User",
          email: user.email,
          role: "patient"
        };
        docName = user.displayName?.replace(/[^a-zA-Z0-9]/g, '_') || "user";
      }

      const loginData = {
        email: user.email,
        name: userData.name || user.displayName || "User",
        lastLogin: new Date().toISOString(),
        loginCount: (userData.loginCount || 0) + 1,
        uid: user.uid,
        timestamp: new Date().toISOString(),
        docName: docName
      };

      try {
        await setDoc(doc(db, "login", docName), loginData);
        console.log("✅ Login details saved to login collection");
      } catch (firestoreError) {
        console.error("❌ Login details save failed:", firestoreError);
      }

      try {
        await updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date().toISOString(),
          loginCount: (userData.loginCount || 0) + 1
        });
        console.log("✅ User login details updated");
      } catch (firestoreError) {
        console.error("❌ User login update failed:", firestoreError);
      }

      const userWithRole = {
        uid: user.uid,
        name: userData.name || user.displayName || "User",
        email: user.email,
        role: userData.role || "patient",
        docName: docName
      };

      if (remember) {
        localStorage.setItem("currentUser", JSON.stringify(userWithRole));
        console.log("✅ User stored in localStorage");
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(userWithRole));
        console.log("✅ User stored in sessionStorage");
      }

      if (userWithRole.role === "admin") {
        console.log("🔄 Redirecting to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("🔄 Redirecting to patient dashboard");
        navigate("/patient/dashboard");
      }

    } catch (error) {
      console.error("❌ Login error:", error);
      
      switch (error.code) {
        case 'auth/invalid-email':
          setError("Invalid email address format.");
          break;
        case 'auth/user-disabled':
          setError("This account has been disabled. Please contact support.");
          break;
        case 'auth/user-not-found':
          setError("No account found with this email. Please check your email or register.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later or reset your password.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your internet connection.");
          break;
        case 'auth/invalid-credential':
          setError("Invalid login credentials. Please check your email and password.");
          break;
        default:
          setError("Login failed. Please try again. Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">

      {/* Background floating shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} className="absolute top-20 left-10 w-6 h-6 bg-blue-400 rounded-full opacity-20" />
        <FloatingElement delay={0.5} className="absolute top-40 right-20 w-8 h-8 bg-purple-400 rounded-full opacity-30" />
        <FloatingElement delay={1} className="absolute bottom-40 left-20 w-10 h-10 bg-indigo-300 rounded-full opacity-25" />
      </div>

      {/* Navbar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-md"
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
          </div>
        </div>
      </motion.header>

      {/* MAIN LAYOUT */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">

          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-8"
          >

            {/* Heading */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm"
              >
                🔒 Secure AI Platform
              </motion.div>

              <h1 className="text-4xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome to
                </span>
                <br />
                <span className="text-gray-900">ArthroCare AI</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed">
                AI-powered early detection and personalized health insights for rheumatoid arthritis prevention.
              </p>
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://image2url.com/images/1763462809734-70bb6d55-ddcc-49f7-9711-6282dada2adb.png"
                alt="AI Health Analytics Dashboard"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>

            {/* ❌ STATS REMOVED AS REQUESTED */}

          </motion.div>

          {/* RIGHT LOGIN CARD */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <NeuroMorphicCard className="w-full max-w-md p-8">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-600 mt-2">
                  Sign in to your ArthroCare account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ${
                        remember 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {remember && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 text-white mx-auto mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">Remember me</span>
                  </label>
                  <Link
                    to="/forgot"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </motion.button>
              </form>

              {/* Create account */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </motion.div>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500"
              >
                <Shield className="w-4 h-4" />
                <span>Protected by end-to-end encryption</span>
              </motion.div>

            </NeuroMorphicCard>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
