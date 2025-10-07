import React, { useState, useEffect } from 'react';
import App from './App';
import AuthPage from './components/AuthPage';

const Main: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for auth state in localStorage on initial load
        try {
            const authStatus = localStorage.getItem('akciovadasz_auth');
            if (authStatus === 'true') {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Could not read auth status from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLoginSuccess = () => {
        localStorage.setItem('akciovadasz_auth', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('akciovadasz_auth');
        // also remove user data for security, though it's mock data
        localStorage.removeItem('akciovadasz_user');
        setIsAuthenticated(false);
    };
    
    if (isLoading) {
        // You could return a full-page spinner here if you wanted
        return <div className="min-h-screen bg-gray-50"></div>;
    }

    if (isAuthenticated) {
        return <App onLogout={handleLogout} />;
    }

    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
};

export default Main;
