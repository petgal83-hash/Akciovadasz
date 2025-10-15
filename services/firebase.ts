// Since Firebase is loaded via a script tag, it's available on the window.
// We declare it here to make TypeScript happy.
declare const firebase: any;

/**
 * --- Firebase Configuration ---
 * The configuration below is intentionally left with empty strings.
 * The application is designed to gracefully fall back to a mock authentication 
 * flow when Firebase is not configured. This allows the core features of the app
 * to be used without a Firebase backend.
 *
 * For a full production deployment with user authentication (Google, etc.), 
 * you MUST replace these with your actual Firebase project's web configuration.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAIa3Wq4-IRcql1FfTHikaWs2hCF7GCnWA",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// A flag to check if Firebase is properly configured.
export const isFirebaseConfigured = !!firebaseConfig.apiKey;

let auth: any;
let storage: any;
let googleProvider: any;

// Initialize Firebase only if an API key is provided.
// This prevents the "invalid API key" error.
if (isFirebaseConfigured && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  storage = firebase.storage();
  googleProvider = new firebase.auth.GoogleAuthProvider();
} else {
  // If Firebase is not configured, create mock objects to prevent runtime errors.
  // The app's logic is designed to fall back to a guest mode.
  if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured. Using mock authentication.");
  }
  auth = {
    setPersistence: () => Promise.resolve(),
    onAuthStateChanged: () => () => {}, // Returns a dummy unsubscribe function
    signOut: () => Promise.resolve(),
  };
  storage = {};
  googleProvider = {};
}

export { auth, storage, googleProvider };


// Define a type for the Firebase user object for better type safety
// Fix: Replaced `firebase.User` with a custom interface to resolve the "Cannot find namespace 'firebase'" error.
// This provides type safety for the user object without needing Firebase's type definitions.
export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
}