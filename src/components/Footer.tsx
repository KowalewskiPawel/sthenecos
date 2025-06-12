import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Instagram, Twitter, Facebook, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background text-text-primary">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Stheneco</span>
            </Link>
            <p className="mt-4 text-text-secondary text-sm">
              The AI-powered fitness platform connecting trainers and athletes for personalized workout experiences.
            </p>
            <div className="flex mt-6 space-x-4">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-4">For Athletes</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Find Trainers
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Workout Plans
                </Link>
              </li>
              <li>
                <Link to="/form-test" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Form Test
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Progress Tracking
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-4">For Trainers</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Join As Trainer
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Upload Workouts
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Client Management
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-4">Help & Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-card pt-8">
          <p className="text-text-secondary text-sm text-center">
            &copy; {new Date().getFullYear()} Stheneco. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;