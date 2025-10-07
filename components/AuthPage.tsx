import React, { useState } from 'react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.804C34.522 4.965 29.656 2.5 24 2.5C11.411 2.5 2.5 11.411 2.5 24s8.911 21.5 21.5 21.5S45.5 36.589 45.5 24c0-1.573-.153-3.097-.439-4.561z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039L38.804 8.804C34.522 4.965 29.656 2.5 24 2.5C16.319 2.5 9.656 6.337 6.306 12.034z" />
        <path fill="#4CAF50" d="M24 45.5c5.331 0 9.731-1.742 12.923-4.664l-6.6-5.238c-1.898 1.286-4.321 2.05-7.323 2.05c-5.223 0-9.655-3.417-11.282-7.94l-6.522 5.025C9.505 39.556 16.227 45.5 24 45.5z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.6 5.238c3.897-3.605 6.184-8.827 6.184-14.809c0-1.573-.153-3.097-.439-4.561z" />
    </svg>
);

const AppleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.226 14.155c.033 1.956-1.536 2.915-1.578 2.932-.033.008-1.186.49-2.613.473-1.46-.017-2.146-.35-3.14-.35-.985 0-1.921.36-2.882.378-1.018.017-2.2-.474-3.22-1.636-1.42-1.62-1.956-3.863-1.956-3.863s.068-3.189 1.636-4.532c.813-.678 1.772-1.027 2.76-1.027.873 0 1.62.333 2.23.333.61 0 1.554-.386 2.515-.358 1.294.042 2.238.452 2.8.926-.05.033-2.18 1.27-2.135 3.59.052 2.657 2.67 3.546 2.74 3.579zM14.62 5.013c.78-.935 1.294-2.2 1.135-3.453-.96.05-2.112.636-2.882 1.578-.7.83-1.35 2.11-1.2 3.328.985.109 2.166-.518 2.947-1.453z" />
    </svg>
);

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login logic
      try {
        const storedUser = localStorage.getItem('akciovadasz_user');
        if (!storedUser) {
          setError('Nincs ilyen felhasználó regisztrálva.');
          return;
        }
        const user = JSON.parse(storedUser);
        if (user.email === email && user.password === password) {
          onLoginSuccess();
        } else {
          setError('Hibás email cím vagy jelszó.');
        }
      } catch {
        setError('Hiba a bejelentkezés során.');
      }
    } else {
      // Registration logic
      if (password !== confirmPassword) {
        setError('A jelszavak nem egyeznek.');
        return;
      }
      if (password.length < 6) {
        setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
        return;
      }
      // Simple validation
      if (!email || !password) {
        setError('Minden mező kitöltése kötelező.');
        return;
      }
      
      localStorage.setItem('akciovadasz_user', JSON.stringify({ email, password }));
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-primary-red">Akcióvadász</h1>
            <p className="text-gray-600 mt-2">A legjobb akciók egy helyen.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{isLogin ? 'Bejelentkezés' : 'Regisztráció'}</h2>
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">Email cím</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-red focus:border-primary-red"
                  required
                />
              </div>
              <div>
                <label htmlFor="password"  className="text-sm font-medium text-gray-700 block mb-2">Jelszó</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-red focus:border-primary-red"
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword"  className="text-sm font-medium text-gray-700 block mb-2">Jelszó megerősítése</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-red focus:border-primary-red"
                    required
                  />
                </div>
              )}
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                className="w-full bg-primary-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300"
              >
                {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
              </button>
            </form>
            
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">vagy</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="space-y-4">
                <button
                    type="button"
                    onClick={onLoginSuccess}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    <GoogleIcon />
                    Bejelentkezés Google-fiókkal
                </button>
                <button
                    type="button"
                    onClick={onLoginSuccess}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg font-semibold text-white bg-black hover:bg-gray-800 transition-colors"
                >
                    <AppleIcon />
                    Bejelentkezés Apple-fiókkal
                </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              {isLogin ? 'Nincs még fiókod?' : 'Már van fiókod?'}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-primary-red hover:underline ml-1">
                {isLogin ? 'Regisztrálj' : 'Jelentkezz be'}
              </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;