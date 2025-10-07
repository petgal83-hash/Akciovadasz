import React, { useState, useEffect } from 'react';
import App from './App';
import AuthPage from './components/AuthPage';
import { auth, FirebaseUser } from './services/firebase';

const Main: React.FC = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Firebase's onAuthStateChanged listener is the single source of truth for the
        // user's authentication state. It will be triggered immediately on page load
        // if the user was already signed in, or after a successful sign-in flow
        // like signInWithPopup.
        const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount to prevent memory leaks.
        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        auth.signOut();
        // The onAuthStateChanged listener will automatically update the state to null.
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

    // Otherwise, show the authentication page.
    return <AuthPage />;
};

export default Main;