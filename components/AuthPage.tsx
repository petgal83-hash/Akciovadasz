import React from 'react';
import Logo from './Logo';

/**
 * NOTE: This is an authentication page. Anonymous sign-in is mocked to bypass
 * Firebase dependency, while Google and Apple sign-in remain placeholders.
 */
interface AuthPageProps {
  onMockGuestSignIn: () => void;
}
 
const AuthPage: React.FC<AuthPageProps> = ({ onMockGuestSignIn }) => {

  const handleGoogleSignIn = () => {
    // Mocked Google Sign-In for now.
    alert("A Google bejelentkezés jelenleg nem elérhető. Kérjük, használja a 'Folytatás vendégként' opciót.");
  };
  
  const handleAnonymousSignIn = () => {
    // This is now mocked and doesn't call Firebase, avoiding the API key error.
    onMockGuestSignIn();
  };
  
  const handleAppleSignIn = () => {
      // Apple Sign-In requires an Apple Developer account and specific server-side setup.
      // This is a placeholder to inform the user.
      alert("Az Apple bejelentkezés jelenleg nem elérhető. Kérjük, használja a 'Folytatás vendégként' opciót.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-primary-teal rounded-t-[100%] -translate-y-1/4" style={{ top: '50%'}}></div>
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-primary-teal opacity-50 rounded-t-[100%] -translate-y-1/4" style={{ top: '55%'}}></div>
      
      <div className="relative z-10 text-center pt-16">
        <div className="inline-block drop-shadow-lg">
          <Logo textClassName="text-gray-800" />
          <p className="text-gray-600 mt-1">A legjobb ajánlatok egy helyen.</p>
        </div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-auto pb-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Üdvözöljük!</h2>
            <p className="text-gray-600 mb-8">Jelentkezzen be, hogy elérje a személyre szabott ajánlatokat.</p>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleAnonymousSignIn}
                className="w-full bg-primary-teal text-white py-3 px-6 rounded-full font-semibold hover:bg-teal-700 transition-transform hover:scale-105 duration-300 shadow-lg"
              >
                Folytatás vendégként
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">Vagy</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-full font-semibold hover:bg-gray-100 transition-transform hover:scale-105 duration-300 shadow-md border border-gray-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                  <span>Google</span>
                </button>
                
                {/* Apple Sign-in Button */}
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  className="w-full bg-black text-white py-3 px-4 rounded-full font-semibold hover:bg-gray-800 transition-transform hover:scale-105 duration-300 shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.47,12.82c-1.38,1.4-2.8,2.94-3.48,2.94c-0.62,0-1.09-0.54-2.22-0.54c-1.2,0-2.3,0.59-3,1.35 c-1.2,1.26-2.16,3.42-2.16,5.32c0,0.1,0,0.21,0,0.31c0.82,0.1,1.54-0.15,2.35-0.62c0.75-0.45,1.53-1.23,2.27-1.23 c0.72,0,1.39,0.72,2.67,0.72c1.23,0,1.81-0.78,2.9-0.78c0.69,0,1.32,0.36,1.92,0.78c0.65,0.45,1.41,0.84,2.25,0.72 c-0.03-2.4-1.04-4.56-2.39-5.95C19.98,14.73,18.82,14.19,17.47,12.82z M12.56,3.31c-0.89-1.11-2.25-1.83-3.63-1.83 c-2.1,0-3.87,1.5-4.92,3.75c-1.77,3.78,0.21,8.04,3.24,10.38c1.17,0.9,2.46,1.44,3.87,1.38c0.15,0,0.29-0.02,0.44-0.02 c1.2,0,2.37-0.48,3.33-1.35c0.84-0.75,1.42-1.74,1.71-2.82c-2.4-1.38-4.02-3.87-3.81-6.78C13.04,6.2,13.56,4.52,12.56,3.31z"/>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
