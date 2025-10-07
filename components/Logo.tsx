import React from 'react';

interface LogoProps {
    className?: string;
    textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', textClassName = 'text-white' }) => (
  <div className={`flex items-center select-none ${className}`}>
     <svg className="h-8 w-8 mr-2 text-primary-teal" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a1 1 0 011-1h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    <span className={`text-2xl font-bold tracking-wide ${textClassName}`}>Akcióvadász</span>
  </div>
);

export default Logo;