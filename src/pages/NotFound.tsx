import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Graphic */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-text-secondary animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-text-primary mb-4">Page Not Found</h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to your fitness journey.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            as={Link} 
            to="/" 
            variant="primary" 
            size="lg"
            className="w-full flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
          
          <Button 
            as={Link} 
            to="/dashboard" 
            variant="outline" 
            size="lg"
            className="w-full flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-card">
          <p className="text-text-secondary text-sm mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/workouts" className="text-primary hover:text-primary-dark text-sm transition-colors">
              Workouts
            </Link>
            <span className="text-text-secondary">•</span>
            <Link to="/progress" className="text-primary hover:text-primary-dark text-sm transition-colors">
              Progress
            </Link>
            <span className="text-text-secondary">•</span>
            <Link to="/chat" className="text-primary hover:text-primary-dark text-sm transition-colors">
              AI Chat
            </Link>
            <span className="text-text-secondary">•</span>
            <Link to="/pricing" className="text-primary hover:text-primary-dark text-sm transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default NotFound;