import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

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

const features = [
  {
    title: "Early Detection Capabilities",
    description: "Identification of pre-clinical and early-stage rheumatoid indicators",
    icon: "🧠",
    gradient: "from-purple-500 to-blue-500"
  },
  {
    title: "Dynamic Recommendation Engine",
    description: "Automatically adjusts all wellness components based on real-time symptom feedback and biomarker changes",
    icon: "🔍",
    gradient: "from-green-500 to-teal-500"
  },
  {
    title: "Dynamic Health Trajectory",
    description: "Real-time monitoring of lifestyle impact with predictive modeling of health outcomes",
    icon: "📊",
    gradient: "from-orange-500 to-red-500"
  }
];

const services = [
  {
    title: "Precision Health Mapping",
    description: "Comprehensive digital twin creation for personalized health optimization strategies",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    delay: 0.1
  },
  {
    title: "AI-Driven Intervention",
    description: "Adaptive treatment plans that evolve with your health data and lifestyle changes",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    delay: 0.3
  },
  {
    title: "Continuous Biomarker Tracking",
    description: "Non-invasive monitoring of critical biomarkers through advanced sensor technology",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    delay: 0.5
  }
];

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.95)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} className="absolute top-20 left-10 w-6 h-6 bg-blue-400 rounded-full opacity-20" />
        <FloatingElement delay={0.5} className="absolute top-40 right-20 w-8 h-8 bg-purple-400 rounded-full opacity-30" />
        <FloatingElement delay={1} className="absolute bottom-40 left-20 w-10 h-10 bg-indigo-300 rounded-full opacity-25" />
      </div>

      {/* Enhanced Header */}
      <motion.header 
        style={{ background: headerBackground }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? "backdrop-blur-md shadow-lg" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ArthroCare
              </span>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-10">
              {["Features", "Technology", "Research", "Contact"].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Begin Assessment
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm"
              >
                Reinventing Healthcare With Predictive Intelligence
              </motion.div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Smart Predictive Analytics
                </span>
                <br />
                <span className="text-gray-900">for Rheumatoid Joint Wellness</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                An intelligent RA risk assessment system combining blood biomarkers and AI models to support early diagnosis and patient-specific lifestyle guidance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all"
                >
                  Start Risk Assessment
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-400 transition-all"
              >
                View Clinical Research
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <NeuroMorphicCard className="p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {/* Interactive dashboard preview */}
                {[1, 2, 3, 4].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
                  >
                    <div className="h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-3" />
                    <div className="h-3 bg-gray-200 rounded-full mb-2 w-3/4" />
                    <div className="h-3 bg-gray-200 rounded-full w-1/2" />
                  </motion.div>
                ))}
              </div>
            </NeuroMorphicCard>
          </motion.div>
        </div>
      </section>

      {/* Innovative Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Multi Factor 
              </span>
              <br />
              <span className="text-gray-900">RA Prediction & Recommendation</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The model combines biomarker trends, age-gender adjusted thresholds, and clinical scoring techniques to deliver accurate, real-time RA risk assessment and health insights.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <NeuroMorphicCard className="p-8 h-full transition-all duration-500 group-hover:shadow-2xl">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">→</span>
                    </div>
                  </div>
                </NeuroMorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Services Section */}
      <section id="technology" className="py-24 bg-gradient-to-br from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Advanced Clinical<br />
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Technology Suite
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: service.delay }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <div 
                    className="h-64 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${service.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                    <p className="text-blue-100">{service.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Features Section */}
      <section id="research" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Advanced Health
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Analytics
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach combines multiple data streams to deliver 
              precise health insights and proactive care recommendations.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto">
                🧠
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Smart RA Risk Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your clinical inputs — ESR, CRP, RF, Anti-CCP, age, and gender — are analyzed to give a clear, easy-to-understand risk assessment for early rheumatoid arthritis.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto">
                🔍
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Pattern & Symptom Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The system compares your biomarkers with age- and gender-specific medical ranges to help identify early inflammatory patterns and possible RA warning signs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto">
                📊
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Progress Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track how your health markers change over time. The platform highlights improvement, stability, or worsening trends across follow-up tests.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW FOOTER SECTION (Replaces old Contact Card) */}
      <footer id="contact" className="bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-white">AI</span>
                </div>
                <span className="text-2xl font-bold">ArthroCare</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering patients with AI-driven insights for early detection and better management of Rheumatoid Arthritis.
              </p>
            </div>

            {/* Links Column */}
            <div>
              <h4 className="font-bold text-lg mb-6">Platform</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#technology" className="hover:text-blue-400 transition-colors">Technology</a></li>
                <li><a href="#research" className="hover:text-blue-400 transition-colors">Clinical Research</a></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Assessment</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Disclaimer</a></li>
              </ul>
            </div>

            {/* Contact Info Column */}
            <div>
              <h4 className="font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-center space-x-3 group cursor-pointer">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    📧
                  </span>
                  <a href="mailto:info@arthrocare.com" className="group-hover:text-white transition-colors">info@arthrocare.com</a>
                </li>
                <li className="flex items-center space-x-3 group cursor-pointer">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    📞
                  </span>
                  <a href="tel:+1555432584" className="group-hover:text-white transition-colors">+1 (555) 432-584</a>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    📍
                  </span>
                  <span>123 Health Tech Blvd, CA</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar (Horizontal Line Code) */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} ArthroCare AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;