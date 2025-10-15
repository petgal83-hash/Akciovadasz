import React, { useState, useEffect } from 'react';
import App from './App';
import AuthPage from './components/AuthPage';
import { auth, FirebaseUser, isFirebaseConfigured } from './services/firebase';

// Since Firebase is loaded via a script tag, we declare it here to access its namespaces.
declare const firebase: any;

const Main: React.FC = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: () => void;

        const setupAuthListener = async () => {
            // Only set up the real Firebase listener if it's configured.
            if (isFirebaseConfigured) {
                try {
                    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                    unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
                        if (firebaseUser) {
                            setUser(firebaseUser);
                        }
                        setIsLoading(false);
                    });
                } catch (error) {
                    console.error("Firebase auth listener setup failed:", error);
                    setIsLoading(false);
                }
            } else {
                // If not configured, just stop loading and proceed to guest mode.
                setIsLoading(false);
            }
        };

        setupAuthListener();

        // Cleanup subscription on unmount to prevent memory leaks.
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const handleMockGuestSignIn = () => {
        const guestUser: FirebaseUser = {
            uid: `guest_${Date.now()}`,
            displayName: 'Vendég Felhasználó',
            email: null,
            photoURL: `https://avatar.vercel.sh/guest.png`,
            isAnonymous: true,
            emailVerified: false,
        };
        setUser(guestUser);
    };

    const handleLogout = () => {
        // Sign out if Firebase is configured, otherwise just clear local state.
        if (isFirebaseConfigured) {
            auth.signOut().then(() => setUser(null)).catch(() => setUser(null));
        } else {
            setUser(null);
        }
    };
    
    // Display a loading spinner while checking for an active session.
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-teal"></div>
            </div>
        );
    }

    // If a user object exists, they are authenticated.
    if (user) {
        return <App onLogout={handleLogout} user={user} />;
    }

    // Otherwise, show the authentication page with the mock sign-in handler.
    return <AuthPage onMockGuestSignIn={handleMockGuestSignIn} />;
};

export default Main;
