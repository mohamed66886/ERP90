// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD90dtZlGUTXEyUD_72ZxjXrBX7oJ1oG3g",
  authDomain: "erp90-8a628.firebaseapp.com",
  projectId: "erp90-8a628",
  storageBucket: "erp90-8a628.firebasestorage.app",
  messagingSenderId: "67289042547",
  appId: "1:67289042547:web:55300d06c6dab5429ba406",
  measurementId: "G-TC88Z96N92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);        // Authentication
const db = getFirestore(app);     // Firestore Database
const storage = getStorage(app);  // File Storage
const functions = getFunctions(app); // Cloud Functions

// Export
export { auth, db, storage, functions };
