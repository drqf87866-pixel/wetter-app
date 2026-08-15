import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase-Konfiguration aus der Firebase Console
// (Projekteinstellungen -> Deine Apps). Diese Werte sind nicht geheim,
// der Zugriffsschutz passiert über die Firestore Security Rules.
const firebaseConfig = {
  apiKey: "AIzaSyAT84-acJx6uYnlSwnEn6e6zRiX7nT5lZA",
  authDomain: "wetter-app-7fb53.firebaseapp.com",
  projectId: "wetter-app-7fb53",
  storageBucket: "wetter-app-7fb53.firebasestorage.app",
  messagingSenderId: "951451903561",
  appId: "1:951451903561:web:d4319ce38bcd8166524198",
  measurementId: "G-XSBSVET29Y",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
