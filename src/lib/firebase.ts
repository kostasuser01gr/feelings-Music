import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfigIssues = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseDiagnostics = {
  isConfigured: firebaseConfigIssues.length === 0,
  issues: firebaseConfigIssues,
};

let persistenceEnabled = false;
async function enablePersistence(dbInstance: Firestore) {
  if (persistenceEnabled) return;
  persistenceEnabled = true;
  try {
    await enableIndexedDbPersistence(dbInstance);
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn("Firestore persistence unavailable:", message);
    }
  }
}

function initFirebase(): FirebaseApp | null {
  if (getApps().length) return getApps()[0] as FirebaseApp;
  if (!firebaseDiagnostics.isConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Firebase config incomplete:", firebaseDiagnostics.issues);
    }
    return null;
  }
  return initializeApp(firebaseConfig);
}

const app = initFirebase();

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;
export { app };

if (db && typeof window !== "undefined") {
  void enablePersistence(db);
}
