import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Video, Users, Zap, Target, BarChart3, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { TRAINER_CONFIGS } from '../services/tavusApi';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'AI Video Coaching',
      description: "Get real-time feedback and form corrections during your workouts with AI video calls.",
      icon: <Video className="h-6 w-6 text-primary" />
    },
    {
      title: 'Personalized Programs',
      description: 'Access workout programs tailored to your fitness level and goals.',
      icon: <Target className="h-6 w-6 text-primary" />
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your improvements with detailed analytics and progress charts.',
      icon: <BarChart3 className="h-6 w-6 text-primary" />
    },
    {
      title: 'Form Analysis',
      description: 'Upload videos and get AI-powered feedback on your exercise form.',
      icon: <TrendingUp className="h-6 w-6 text-primary" />
    }
  ];

  const getTrainerIcon = (specialty: string) => {
    if (specialty.includes('Strength')) return <Zap className="h-8 w-8 text-primary" />;
    if (specialty.includes('Functional')) return <Target className="h-8 w-8 text-primary" />;
    return <Video className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            YOUR AI FITNESS{' '}
            <span className="relative">
              <span className="relative z-10">COACH</span>
              <span className="absolute bottom-0 left-0 w-full h-4 bg-primary -z-10"></span>
            </span>
          </h1>
          <p className="text-text-secondary text-xl mb-12">
            Get personalized workouts, real-time form feedback, and expert guidance from AI trainers specialized in your fitness goals
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="inline-block bg-primary text-background px-12 py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-all duration-300"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/chat"
                className="inline-block border border-primary text-primary px-12 py-4 rounded-full text-lg font-medium hover:bg-primary hover:text-background transition-all duration-300"
              >
                Start AI Chat
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="inline-block bg-primary text-background px-12 py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link
                to="/pricing"
                className="inline-block border border-primary text-primary px-12 py-4 rounded-full text-lg font-medium hover:bg-primary hover:text-background transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">EVERYTHING YOU NEED</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-2xl border border-background hover:border-primary transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Trainers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">MEET YOUR AI TRAINERS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(TRAINER_CONFIGS).map(([key, config]) => (
            <div
              key={key}
              className="bg-card p-8 rounded-2xl border border-background hover:border-primary transition-all duration-300 hover:translate-y-[-4px]"
            >
              <div className="flex items-center mb-6">
                {getTrainerIcon(config.specialty)}
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-text-primary">{config.name}</h3>
                  <p className="text-text-secondary">{config.specialty}</p>
                </div>
              </div>
              
              <p className="text-text-secondary mb-6 leading-relaxed">
                {config.specialty === 'Strength Training & Powerlifting' && 
                  'Expert in progressive overload, powerlifting techniques, and building confidence in the gym.'}
                {config.specialty === 'Functional Fitness & Athletic Performance' && 
                  'Focused on movement quality, athletic performance, and real-world fitness applications.'}
                {config.specialty === 'HIIT, Cardio & Weight Loss' && 
                  'High-energy specialist in cardiovascular fitness, weight loss, and metabolic conditioning.'}
              </p>
              
              <Link
                to={user ? `/chat/${key}` : '/auth'}
                className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
              >
                {user ? `Chat with ${config.name}` : 'Sign up to chat'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">HOW IT WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-2xl border border-background text-center">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Sign Up & Set Goals</h3>
            <p className="text-text-secondary">
              Create your account, complete a fitness assessment, and set your personal goals
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-2xl border border-background text-center">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Choose Your AI Trainer</h3>
            <p className="text-text-secondary">
              Select from specialized trainers and get personalized workout programs
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-2xl border border-background text-center">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Train & Improve</h3>
            <p className="text-text-secondary">
              Start working out with real-time AI feedback and track your progress
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">
            READY TO TRANSFORM YOUR FITNESS?
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Join thousands of users who are already achieving their goals with AI coaching
          </p>
          
          {user ? (
            <Link
              to="/dashboard"
              className="inline-block bg-primary text-background px-12 py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-all duration-300"
            >
              Continue Your Journey
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-block bg-primary text-background px-12 py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-all duration-300"
            >
              Start Free Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;