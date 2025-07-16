import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAuth, signOut } from 'firebase/auth';

const Header = () => {
  const { currentUser } = useAuth();

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth);
  };

  return (
    <header className="bg-glass backdrop-filter backdrop-blur-xs shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span className="text-2xl font-bold text-white">AI Diligence Pro</span>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/#features" className="text-white hover:text-blue-300">Features</a>
          <a href="/#pricing" className="text-white hover:text-blue-300">Pricing</a>
          <a href="/demo" className="text-white hover:text-blue-300">Demo</a>
          {currentUser ? (
            <>
              <a href="/dashboard" className="text-white hover:text-blue-300">Dashboard</a>
              <button onClick={handleSignOut} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <a href="/auth" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
