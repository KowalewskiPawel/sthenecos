import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  CreditCard, 
  LogOut, 
  Edit, 
  Save,
  Users,
  Target,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateProfile, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    user_role: user?.user_role || 'athlete',
    bio: user?.bio || '',
    specialty: user?.specialty || '',
    experience_years: user?.experience_years || '',
    fitness_level: user?.fitness_level || 'beginner',
    fitness_goals: user?.fitness_goals || []
  });

  const [notificationSettings, setNotificationSettings] = useState({
    workout_reminders: true,
    progress_updates: true,
    trainer_messages: true,
    app_updates: false,
    promotional: false
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

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        user_role: formData.user_role as 'athlete' | 'trainer',
        bio: formData.bio,
        specialty: formData.specialty,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
        fitness_level: formData.fitness_level as 'beginner' | 'intermediate' | 'advanced',
        fitness_goals: formData.fitness_goals
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">Profile Settings</h2>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        user_role: user?.user_role || 'athlete',
                        bio: user?.bio || '',
                        specialty: user?.specialty || '',
                        experience_years: user?.experience_years || '',
                        fitness_level: user?.fitness_level || 'beginner',
                        fitness_goals: user?.fitness_goals || []
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background mr-1"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>

            {/* User Mode Switcher */}
            <div className="bg-primary/10 border border-primary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Account Mode
              </h3>
              <p className="text-text-secondary mb-4">
                Switch between athlete and trainer modes to access different features and dashboards.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => isEditing && setFormData(prev => ({ ...prev, user_role: 'athlete' }))}
                  disabled={!isEditing}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    formData.user_role === 'athlete'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-background text-text-secondary hover:border-primary'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <span className="font-medium">Athlete Mode</span>
                  <p className="text-xs mt-1">
                    Access workouts, AI trainers, and progress tracking
                  </p>
                </button>

                <button
                  onClick={() => isEditing && setFormData(prev => ({ ...prev, user_role: 'trainer' }))}
                  disabled={!isEditing}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    formData.user_role === 'trainer'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-background text-text-secondary hover:border-primary'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <span className="font-medium">Trainer Mode</span>
                  <p className="text-xs mt-1">
                    Create workouts, manage clients, and build programs
                  </p>
                </button>
              </div>

              {formData.user_role !== user?.user_role && isEditing && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    <strong>Note:</strong> Changing your account mode will update your dashboard and available features. You can switch back anytime.
                  </p>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="bg-card rounded-lg p-6 border border-background">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 bg-background border border-background rounded-lg text-text-primary opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
                </div>
              </div>

              {formData.user_role === 'trainer' && (
                <>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary disabled:opacity-50"
                      placeholder="Tell clients about your training philosophy and experience..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Specialty
                      </label>
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary disabled:opacity-50"
                      >
                        <option value="">Select specialty</option>
                        {trainerSpecialties.map(specialty => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>

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
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary disabled:opacity-50"
                        placeholder="Years"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.user_role === 'athlete' && (
                <>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Fitness Level
                    </label>
                    <select
                      value={formData.fitness_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, fitness_level: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary disabled:opacity-50"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      Fitness Goals
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {fitnessGoals.map(goal => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => isEditing && handleGoalToggle(goal)}
                          disabled={!isEditing}
                          className={`p-2 rounded-lg text-sm border transition-colors ${
                            formData.fitness_goals.includes(goal)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-background text-text-secondary hover:border-primary'
                          } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Notification Settings</h2>
            
            <div className="bg-card rounded-lg p-6 border border-background">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Push Notifications</h3>
              
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-text-primary font-medium">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </p>
                      <p className="text-text-secondary text-sm">
                        {key === 'workout_reminders' && 'Get reminded about scheduled workouts'}
                        {key === 'progress_updates' && 'Weekly progress summaries and achievements'}
                        {key === 'trainer_messages' && 'Messages from your trainer or clients'}
                        {key === 'app_updates' && 'New features and app updates'}
                        {key === 'promotional' && 'Special offers and promotional content'}
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={value}
                      onChange={(checked) => setNotificationSettings(prev => ({ ...prev, [key]: checked }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Subscription</h2>
            
            <div className="bg-card rounded-lg p-6 border border-background">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Current Plan</h3>
                  <p className="text-text-secondary">Manage your subscription</p>
                </div>
                <div className="bg-primary text-background px-3 py-1 rounded-full text-sm font-medium">
                  {user?.subscription_tier?.charAt(0).toUpperCase() + user?.subscription_tier?.slice(1)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.subscription_status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user?.subscription_status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Member since</span>
                  <span className="text-text-primary">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/pricing">
                  <Button variant="primary" className="w-full">
                    {user?.subscription_tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Security & Privacy</h2>
            
            <div className="bg-card rounded-lg p-6 border border-background">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                    placeholder="Confirm new password"
                  />
                </div>

                <Button variant="primary">
                  Update Password
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-background">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Account Actions</h3>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Download My Data
                </Button>
                
                <Button variant="outline" className="w-full text-red-400 border-red-500 hover:bg-red-900/20">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/dashboard" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary">Manage your account preferences and settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-background overflow-hidden">
              <nav className="p-2">
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                    activeTab === 'profile' 
                      ? 'bg-background text-primary' 
                      : 'text-text-primary hover:bg-background/50'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                    activeTab === 'notifications' 
                      ? 'bg-background text-primary' 
                      : 'text-text-primary hover:bg-background/50'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
                
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                    activeTab === 'subscription' 
                      ? 'bg-background text-primary' 
                      : 'text-text-primary hover:bg-background/50'
                  }`}
                  onClick={() => setActiveTab('subscription')}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Subscription</span>
                </button>

                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                    activeTab === 'security' 
                      ? 'bg-background text-primary' 
                      : 'text-text-primary hover:bg-background/50'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-text-primary hover:bg-background/50 mt-2 border-t border-background"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Switch Component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-primary' : 'bg-background'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default Settings;