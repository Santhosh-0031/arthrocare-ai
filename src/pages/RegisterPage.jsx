import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Shield } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
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

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 6) return "Password must be at least 6 characters.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    return null;
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return false;
    }

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setError(pwdErr);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Starting registration process...");

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ User created successfully:", user.uid);

      // Update user profile with display name
      await updateProfile(user, {
        displayName: name.trim()
      });

      console.log("✅ User profile updated");

      // Create sanitized document name
      const docName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');

      // Prepare comprehensive user data
      const userData = {
        name: name.trim(),
        email: email.trim(),
        role: 'patient',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        uid: user.uid,
        registrationMethod: 'email',
        status: 'active',
        docName: docName
      };

      console.log("📝 Saving to Firestore...");

      // Save to users collection with UID as document ID
      try {
        console.log("🔄 Saving to users collection...");
        await setDoc(doc(db, "users", user.uid), userData);
        console.log("✅ User data saved to users collection");
      } catch (usersError) {
        console.error("❌ Users collection save failed:", usersError);
        // Continue anyway since auth user is created
      }

      // Also save to signup collection with name as document ID
      try {
        console.log("🔄 Saving to signup collection...");
        await setDoc(doc(db, "signup", docName), userData);
        console.log("✅ User data saved to signup collection");
      } catch (signupError) {
        console.error("❌ Signup collection save failed:", signupError);
        // Continue anyway since users collection might have worked
      }

      setSuccess("🎉 Registration successful! Redirecting to login...");
      
      // Sign out the user immediately after registration for security
      await auth.signOut();
      console.log("✅ User signed out after registration");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("❌ Registration error:", error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError("An account with this email already exists. Please try logging in instead.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address format. Please check your email.");
          break;
        case 'auth/operation-not-allowed':
          setError("Email/password accounts are not enabled. Please contact support.");
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please choose a stronger password with at least 6 characters including a number.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your internet connection and try again.");
          break;
        case 'auth/too-many-requests':
          setError("Too many attempts. Please try again later.");
          break;
        case 'permission-denied':
          setError("Database permission denied. Please check Firestore rules.");
          break;
        default:
          setError("Registration failed. Please try again. Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} className="absolute top-20 left-10 w-6 h-6 bg-blue-400 rounded-full opacity-20" />
        <FloatingElement delay={0.5} className="absolute top-40 right-20 w-8 h-8 bg-purple-400 rounded-full opacity-30" />
        <FloatingElement delay={1} className="absolute bottom-40 left-20 w-10 h-10 bg-indigo-300 rounded-full opacity-25" />
      </div>

      {/* Header */}
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

      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">
          {/* Left Panel - Simplified with Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium text-sm"
              >
                🚀 Start Your Journey
              </motion.div>
              <h1 className="text-4xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Join ArthroCare
                </span>
                <br />
                <span className="text-gray-900">AI Today</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Begin your proactive health journey with AI-powered early detection and personalized insights for rheumatoid arthritis prevention.
              </p>
            </div>

            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                alt="Healthcare Professional with Technology"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 gap-4 pt-6"
            >
              {[
                { value: "Early Detection", icon: "🔍" },
                { value: "AI Insights", icon: "🧠" },
                { value: "24/7 Support", icon: "🛡️" },
                { value: "Personalized", icon: "🎯" }
              ].map((item, index) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Panel - Registration Form */}
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
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <User className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-600 mt-2">
                  Join our AI-powered health platform
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Email Field */}
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

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters with a number"
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

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">Password Requirements:</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${password.length >= 6 ? 'bg-green-500' : 'bg-blue-300'}`}></span>
                      At least 6 characters
                    </li>
                    <li className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(password) ? 'bg-green-500' : 'bg-blue-300'}`}></span>
                      Contains at least one number
                    </li>
                    <li className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${password === confirm && password !== '' ? 'bg-green-500' : 'bg-blue-300'}`}></span>
                      Passwords match
                    </li>
                  </ul>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
                  >
                    {success}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in here
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
                <span>Your data is protected and encrypted</span>
              </motion.div>
            </NeuroMorphicCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;