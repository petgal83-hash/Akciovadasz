import React from 'react';
import Logo from './Logo';
import { FirebaseUser } from '../services/firebase';

interface HeaderProps {
    onLogout: () => void;
    user: FirebaseUser;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user }) => {
  return (
    <header className="bg-primary-teal text-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex-1">
            <Logo />
        </div>
        <div className="flex items-center space-x-4">
            {user.photoURL && (
                <img src={user.photoURL} alt="Profilkép" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
            )}
            {user.displayName && (
                <span className="hidden sm:inline font-medium text-sm">{user.displayName}</span>
            )}
             {!user.isAnonymous && user.email && !user.displayName &&(
                <span className="hidden sm:inline font-medium text-sm">{user.email}</span>
            )}
            <button
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Kijelentkezés"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;