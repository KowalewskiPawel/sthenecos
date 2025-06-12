import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, Dumbbell, MessageSquare, LogOut, Settings, Users, Target, Puzzle, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading, isTrainer, isAthlete } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      closeMenu();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Different navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: null },
      { path: '/chat', label: 'AI Chat', icon: <MessageSquare className="h-4 w-4 mr-1" /> }
    ];

    if (isAthlete()) {
      return [
        ...commonItems,
        { path: '/workouts', label: 'Workouts', icon: <Target className="h-4 w-4 mr-1" /> },
        { path: '/progress', label: 'Progress', icon: null },
        { path: '/generate-workout', label: 'AI Workout', icon: <Brain className="h-4 w-4 mr-1" /> },
        { path: '/form-analysis', label: 'Form Analysis', icon: null }
      ];
    } else if (isTrainer()) {
      return [
        ...commonItems,
        { path: '/build-workout', label: 'Workout Builder', icon: <Puzzle className="h-4 w-4 mr-1" /> },
        { path: '/generate-workout', label: 'AI Generator', icon: <Brain className="h-4 w-4 mr-1" /> },
        { path: '/clients', label: 'Clients', icon: <Users className="h-4 w-4 mr-1" /> },
        { path: '/workouts', label: 'Programs', icon: null }
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-card border-b border-background' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-text-primary">Stheneco</span>
              {user && (
                <span className="ml-3 text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {isTrainer() ? 'TRAINER' : 'ATHLETE'}
                </span>
              )}
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-primary' 
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                Home
              </Link>
              
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'text-primary' 
                      : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {!user && !loading && (
                <Link 
                  to="/pricing"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/pricing' 
                      ? 'text-primary' 
                      : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  Pricing
                </Link>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Menu or Auth Buttons */}
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              ) : user ? (
                <div className="relative ml-3 group">
                  <button 
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                      {isTrainer() ? <Users className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="hidden lg:block">{user.name}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 border border-background">
                      <div className="px-4 py-2 border-b border-background">
                        <p className="text-sm font-medium text-text-primary">{user.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-text-secondary">
                            {user.subscription_tier} plan
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isTrainer() 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {isTrainer() ? 'Trainer' : 'Athlete'}
                          </span>
                        </div>
                      </div>
                      
                      <Link 
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-background hover:text-primary"
                        onClick={closeMenu}
                      >
                        Dashboard
                      </Link>
                      
                      <Link 
                        to="/settings"
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-background hover:text-primary flex items-center"
                        onClick={closeMenu}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      
                      {isAthlete() && (
                        <Link 
                          to="/form-analysis"
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-background hover:text-primary"
                          onClick={closeMenu}
                        >
                          Form Analysis
                        </Link>
                      )}
                      
                      <Link 
                        to="/pricing"
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-background hover:text-primary"
                        onClick={closeMenu}
                      >
                        Subscription
                      </Link>
                      
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-background hover:text-primary flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="text-text-secondary hover:text-primary focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-b border-background shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/' 
                  ? 'bg-background text-primary' 
                  : 'text-text-secondary hover:bg-background hover:text-primary'
              }`}
              onClick={closeMenu}
            >
              Home
            </Link>
            
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'bg-background text-primary' 
                    : 'text-text-secondary hover:bg-background hover:text-primary'
                }`}
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
            
            {user ? (
              <>
                <Link 
                  to="/settings"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/settings' 
                      ? 'bg-background text-primary' 
                      : 'text-text-secondary hover:bg-background hover:text-primary'
                  }`}
                  onClick={closeMenu}
                >
                  <Settings className="h-4 w-4 mr-2 inline" />
                  Settings
                </Link>
                
                {/* User Info */}
                <div className="px-3 py-2 border-t border-background mt-2">
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-primary">
                      {user.subscription_tier} plan
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isTrainer() 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {isTrainer() ? 'Trainer' : 'Athlete'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-background hover:text-primary flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/pricing"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/pricing' 
                      ? 'bg-background text-primary' 
                      : 'text-text-secondary hover:bg-background hover:text-primary'
                  }`}
                  onClick={closeMenu}
                >
                  Pricing
                </Link>
                <div className="px-3 py-2 space-y-2">
                  <Link to="/auth" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={closeMenu}>
                    <Button variant="primary" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;