// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoq0TPJqP2Ul3094akHGI43jj0SIM-MAI",
  authDomain: "arthocare-ai.firebaseapp.com",
  projectId: "arthocare-ai",
  storageBucket: "arthocare-ai.firebasestorage.app",
  messagingSenderId: "981989352300",
  appId: "1:981989352300:web:8481cbaabea71febb94949",
  measurementId: "G-YLHYDZEKN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, analytics, auth, db };
export default app;