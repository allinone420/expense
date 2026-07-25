import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  type Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';

import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize App safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with offline persistence
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalAutoDetectLongPolling: true,
  }, firebaseConfigData.firestoreDatabaseId || '(default)');
} catch {
  db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || '(default)');
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
  app, 
  db, 
  auth, 
  signInAnonymously, 
  GoogleAuthProvider, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
};
