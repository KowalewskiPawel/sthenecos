import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-background hover:border-primary transition-all duration-200 group"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for light mode */}
        <Sun 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark 
              ? 'opacity-0 rotate-90 scale-75' 
              : 'opacity-100 rotate-0 scale-100 text-yellow-500'
          }`} 
        />
        
        {/* Moon icon for dark mode */}
        <Moon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark 
              ? 'opacity-100 rotate-0 scale-100 text-blue-400' 
              : 'opacity-0 -rotate-90 scale-75'
          }`} 
        />
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200 ${
        isDark ? 'bg-blue-400' : 'bg-yellow-500'
      }`} />
    </button>
  );
};

export default ThemeToggle;