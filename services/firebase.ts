// Since Firebase is loaded via a script tag, it's available on the window.
// We declare it here to make TypeScript happy.
declare const firebase: any;

/**
 * IMPORTANT: Replace the placeholder values below with your own Firebase project's configuration.
 * You can get this from the Firebase console:
 * Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

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
