import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'white' | 'colored';
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'default', 
  size = 'md',
  withText = true 
}) => {
  // Size mapping
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' }
  };

  // Color mapping
  const colorMap = {
    default: {
      primary: 'text-primary',
      secondary: 'text-foreground',
      accent: 'text-primary'
    },
    white: {
      primary: 'text-white',
      secondary: 'text-white',
      accent: 'text-white'
    },
    colored: {
      primary: 'text-primary',
      secondary: 'text-blue-600 dark:text-blue-400',
      accent: 'text-amber-500'
    }
  };

  const colors = colorMap[variant];
  const dimensions = sizeMap[size];

  return (
    <Link to="/" className="flex items-center gap-2 no-underline">
      <div className="relative">
        <svg 
          width={dimensions.icon} 
          height={dimensions.icon} 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Main circle */}
          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" className={colors.primary} />
          
          {/* AI letters */}
          <path 
            d="M14 16L18 32M18 32H10M18 32H26" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={colors.secondary}
          />
          <path 
            d="M32 16V32M28 16H36" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={colors.secondary}
          />
          
          {/* Accent dot */}
          <circle cx="24" cy="24" r="4" fill="currentColor" className={colors.accent} />
        </svg>
      </div>
      
      {withText && (
        <div className={`font-bold ${dimensions.text} tracking-tight`}>
          <span className={colors.primary}>ai</span>
          <span className={colors.secondary}>diligence</span>
          <span className={colors.accent}>.pro</span>
        </div>
      )}
    </Link>
  );
};

export default Logo; 