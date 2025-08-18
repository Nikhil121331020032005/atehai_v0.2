// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "verde-budget-n7692.firebaseapp.com",
  projectId: "verde-budget-n7692",
  storageBucket: "verde-budget-n7692.firebasestorage.app",
  messagingSenderId: "89197451904",
  appId: "1:89197451904:web:3076cf25306e0dda26a465",
  measurementId: ""
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
