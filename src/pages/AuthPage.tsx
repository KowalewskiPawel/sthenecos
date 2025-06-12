import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { User, Mail, Lock, Target, Zap, Users, GraduationCap, Award } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { signUp, signIn, loading, error, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    user_role: 'athlete' as 'athlete' | 'trainer',
    fitness_level: 'beginner',
    fitness_goals: [] as string[],
    specialty: '',
    bio: '',
    experience_years: '',
    certifications: [] as string[]
  });

  const fitnessGoals = [
    'Lose Weight',
    'Build Muscle',
    'Improve Strength',
    'Increase Endurance',
    'Better Flexibility',
    'General Fitness'
  ];

  const trainerSpecialties = [
    'Strength Training & Powerlifting',
    'Functional Fitness & Athletic Performance',
    'HIIT, Cardio & Weight Loss',
    'Yoga & Flexibility',
    'Bodybuilding & Physique',
    'Sports-Specific Training',
    'Rehabilitation & Injury Prevention',
    'Nutrition Coaching'
  ];

  const commonCertifications = [
    'NASM Certified Personal Trainer',
    'ACE Personal Trainer',
    'ACSM Certified Exercise Physiologist',
    'NSCA Strength & Conditioning Specialist',
    'CrossFit Level 1 Trainer',
    'Precision Nutrition Certified',
    'Yoga Alliance RYT-200',
    'PADI Scuba Instructor'
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'signup') {
        const userData = {
          name: formData.name,
          user_role: formData.user_role,
          fitness_level: formData.fitness_level,
          fitness_goals: formData.fitness_goals,
          ...(formData.user_role === 'trainer' && {
            specialty: formData.specialty,
            bio: formData.bio,
            experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
            certifications: formData.certifications
          })
        };
        await signUp(formData.email, formData.password, userData);
        // Don't navigate immediately - let the auth state change handle it
      } else {
        await signIn(formData.email, formData.password);
        // Don't navigate immediately - let the auth state change handle it
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Error is already set in the auth context
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      fitness_goals: prev.fitness_goals.includes(goal)
        ? prev.fitness_goals.filter(g => g !== goal)
        : [...prev.fitness_goals, goal]
    }));
  };

  const handleCertificationToggle = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-xl p-8 border border-background">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {mode === 'signin' ? 'Welcome Back' : 'Join Stheneco'}
            </h1>
            <p className="text-text-secondary mt-2">
              {mode === 'signin' 
                ? 'Sign in to continue your fitness journey' 
                : 'Start your AI-powered fitness experience'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">
                    I want to join as a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, user_role: 'athlete' }))}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.user_role === 'athlete'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-background text-text-secondary hover:border-primary'
                      }`}
                    >
                      <Target className="h-6 w-6 mx-auto mb-2" />
                      <span className="font-medium">Athlete</span>
                      <p className="text-xs mt-1">Get personalized workouts</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, user_role: 'trainer' }))}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.user_role === 'trainer'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-background text-text-secondary hover:border-primary'
                      }`}
                    >
                      <Users className="h-6 w-6 mx-auto mb-2" />
                      <span className="font-medium">Trainer</span>
                      <p className="text-xs mt-1">Train and manage clients</p>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                {formData.user_role === 'athlete' ? (
                  <>
                    {/* Fitness Level for Athletes */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Fitness Level
                      </label>
                      <select
                        value={formData.fitness_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, fitness_level: e.target.value }))}
                        className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Fitness Goals for Athletes */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Fitness Goals (select all that apply)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {fitnessGoals.map(goal => (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => handleGoalToggle(goal)}
                            className={`p-2 rounded-lg text-sm border transition-colors ${
                              formData.fitness_goals.includes(goal)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-background text-text-secondary hover:border-primary'
                            }`}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Trainer Specialty */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Specialty
                      </label>
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                        className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                        required
                      >
                        <option value="">Select your specialty</option>
                        {trainerSpecialties.map(specialty => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Years */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.experience_years}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                        className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                        placeholder="Years of experience"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                        placeholder="Tell us about your training philosophy and experience..."
                      />
                    </div>

                    {/* Certifications */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Certifications (select all that apply)
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {commonCertifications.map(cert => (
                          <button
                            key={cert}
                            type="button"
                            onClick={() => handleCertificationToggle(cert)}
                            className={`w-full p-2 rounded-lg text-sm border transition-colors text-left ${
                              formData.certifications.includes(cert)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-background text-text-secondary hover:border-primary'
                            }`}
                          >
                            {cert}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background mr-2"></div>
                  {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setFormData(prev => ({ ...prev, email: '', password: '', name: '' }));
              }}
              className="text-primary hover:underline text-sm"
              disabled={loading}
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;