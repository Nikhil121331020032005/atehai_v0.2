// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAta5Re35WJkb2G54rgS29K6JZLPmWX1E",
  authDomain: "atehai.firebaseapp.com",
  projectId: "atehai",
  storageBucket: "atehai.firebasestorage.app",
  messagingSenderId: "1038752064250",
  appId: "1:1038752064250:web:d8ad5ae63e318ff1e39f43",
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
const storage = getStorage(app);

export { auth, db, storage };
