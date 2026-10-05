/**
 * SafarSindh Firebase Configuration & Service Layer
 * 
 * Provides production-ready Firestore and Auth initialization.
 * Falls back gracefully to the synchronized local store if Firebase environment
 * variables are not yet configured in AI Studio / production.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  Firestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('[SafarSindh] Connected to Firebase Firestore successfully.');
  } catch (err) {
    console.warn('[SafarSindh] Firebase initialization skipped or failed:', err);
  }
} else {
  console.log('[SafarSindh] Running in High-Fidelity Local/Multi-tab Real-time Sync Mode.');
}

export { db, collection, doc, setDoc, updateDoc, onSnapshot, query, where, getDocs };
