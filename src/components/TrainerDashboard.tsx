import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { clientService, ClientWithProgress } from '../services/clientService';
import { getUserGeneratedWorkouts } from '../services/aiWorkoutGenerator';
import Button from './ui/Button';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  PlusCircle,
  MessageSquare,
  Brain,
  BarChart3,
  Target,
  Award,
  Clock,
  Puzzle,
  UserPlus,
  FileText,
  Settings,
  Loader
} from 'lucide-react';

const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientWithProgress[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load real client data
      const clientsData = await clientService.getTrainerClients(user.id);
      setClients(clientsData);
      
      // Load recent AI generated workouts
      const workoutsData = await getUserGeneratedWorkouts(user.id);
      setRecentWorkouts(workoutsData?.slice(0, 5) || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Workout Builder',
      description: 'Build workouts from ready-made blocks',
      icon: <Puzzle className="h-6 w-6" />,
      link: '/build-workout',
      color: 'bg-primary/10 text-primary border-primary/20'
    },
    {
      title: 'Generate AI Workout',
      description: 'Create personalized workouts for clients',
      icon: <Brain className="h-6 w-6" />,
      link: '/generate-workout',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      title: 'Manage Clients',
      description: 'View and manage your client roster',
      icon: <Users className="h-6 w-6" />,
      link: '/clients',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      title: 'Chat with Clients',
      description: 'Message and support your clients',
      icon: <MessageSquare className="h-6 w-6" />,
      link: '/chat',
      color: 'bg-green-500/10 text-green-400 border-green-500/20'
    }
  ];

  const trainerFeatures = [
    {
      title: 'Create Programs',
      description: 'Build comprehensive workout programs',
      icon: <FileText className="h-5 w-5" />,
      link: '/workouts'
    },
    {
      title: 'Add New Client',
      description: 'Onboard new clients to your roster',
      icon: <UserPlus className="h-5 w-5" />,
      link: '/clients'
    },
    {
      title: 'Business Analytics',
      description: 'Track your training business metrics',
      icon: <BarChart3 className="h-5 w-5" />,
      link: '/analytics'
    }
  ];

  // Calculate real stats
  const totalWorkouts = clients.reduce((sum, client) => sum + client.total_workouts, 0);
  const avgProgress = clients.length > 0 
    ? Math.round(clients.reduce((sum, client) => sum + client.progress_score, 0) / clients.length)
    : 0;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const thisMonthRevenue = activeClients * 150; // Estimated based on $150 per active client

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-text-secondary">Loading your trainer dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Welcome back, Coach {user?.name}! 🎯
              </h1>
              <p className="text-text-secondary">
                Ready to help your clients achieve their fitness goals? Here's your trainer dashboard.
              </p>
              <div className="mt-2 flex items-center space-x-4">
                {user?.specialty && (
                  <div className="flex items-center text-sm text-text-secondary">
                    <Award className="h-4 w-4 mr-1 text-primary" />
                    <span>{user.specialty}</span>
                  </div>
                )}
                {user?.experience_years && (
                  <div className="flex items-center text-sm text-text-secondary">
                    <Clock className="h-4 w-4 mr-1 text-primary" />
                    <span>{user.experience_years} years experience</span>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-500/10 border border-blue-500 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <div>
                    <p className="text-blue-400 font-medium text-sm">Trainer Mode</p>
                    <p className="text-text-secondary text-xs">Client & Program Management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Active Clients</p>
                <p className="text-2xl font-bold text-text-primary">{activeClients}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Total Workouts</p>
                <p className="text-2xl font-bold text-text-primary">{totalWorkouts}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Avg Client Progress</p>
                <p className="text-2xl font-bold text-text-primary">{avgProgress}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Est. Monthly Revenue</p>
                <p className="text-2xl font-bold text-text-primary">${thisMonthRevenue}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <h2 className="text-xl font-semibold text-text-primary mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-card rounded-xl p-6 border border-background hover:border-primary transition-colors duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 border ${action.color}`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Trainer Features */}
            <div className="bg-card rounded-xl p-6 border border-background mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Trainer Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trainerFeatures.map((feature, index) => (
                  <Link
                    key={index}
                    to={feature.link}
                    className="p-4 bg-background rounded-lg border border-background hover:border-primary transition-colors group"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                        {feature.icon}
                      </div>
                      <h4 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                        {feature.title}
                      </h4>
                    </div>
                    <p className="text-text-secondary text-sm">{feature.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent AI Workouts */}
            <div className="bg-card rounded-xl p-6 border border-background">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Recent AI Workouts</h3>
              
              {recentWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary text-sm">{workout.title}</h4>
                          <p className="text-text-secondary text-xs">
                            {new Date(workout.created_at).toLocaleDateString()} • {workout.duration_minutes} min
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-primary font-medium text-sm capitalize">
                          {workout.fitness_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary">No AI workouts generated yet</p>
                  <Link to="/generate-workout" className="block mt-4">
                    <Button variant="primary" size="sm">
                      Generate First Workout
                    </Button>
                  </Link>
                </div>
              )}
              
              <Link to="/saved-workouts" className="block mt-4">
                <Button variant="outline" className="w-full">
                  View All Workouts
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Client Overview */}
            <div className="bg-card rounded-xl p-6 border border-background mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Client Overview</h3>
                <Link to="/clients">
                  <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Client
                  </Button>
                </Link>
              </div>
              
              {clients.length > 0 ? (
                <div className="space-y-4">
                  {clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between py-3 border-b border-background last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <span className="text-primary text-sm font-bold">
                            {client.client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary text-sm">{client.client.name}</p>
                          <p className="text-text-secondary text-xs">
                            {client.client.fitness_level} • {client.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-medium text-sm">{client.progress_score}%</p>
                        <div className="w-16 h-1 bg-background rounded-full mt-1">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${client.progress_score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {clients.length > 5 && (
                    <p className="text-text-secondary text-sm text-center pt-3">
                      +{clients.length - 5} more clients
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                  <p className="text-text-secondary text-sm mb-3">No clients yet</p>
                  <Link to="/clients">
                    <Button variant="primary" size="sm">
                      Add Your First Client
                    </Button>
                  </Link>
                </div>
              )}
              
              <Link to="/clients" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Manage All Clients
                </Button>
              </Link>
            </div>

            {/* Business Insights */}
            <div className="bg-card rounded-xl p-6 border border-background mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Business Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Total Clients</span>
                  <span className="text-text-primary font-medium">{clients.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Active Clients</span>
                  <span className="text-text-primary font-medium">{activeClients}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Workouts Created</span>
                  <span className="text-text-primary font-medium">{recentWorkouts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Avg Progress</span>
                  <span className="text-text-primary font-medium">{avgProgress}%</span>
                </div>
              </div>
            </div>

            {/* Trainer Tools CTA */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500">
              <div className="text-center">
                <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  AI-Powered Tools
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Use AI to create better workouts and analyze client progress faster
                </p>
                <div className="space-y-2">
                  <Link to="/build-workout">
                    <Button variant="primary" className="w-full">
                      Workout Builder
                    </Button>
                  </Link>
                  <Link to="/generate-workout">
                    <Button variant="outline" className="w-full">
                      AI Generator
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Features for Pro Users */}
        {user?.subscription_tier === 'pro' && (
          <div className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  🏆 Pro Trainer Features Active
                </h3>
                <p className="text-text-secondary mb-2">
                  You have access to advanced trainer tools and analytics.
                </p>
                <ul className="text-text-secondary text-sm space-y-1">
                  <li>• White-label client portal</li>
                  <li>• Advanced business analytics</li>
                  <li>• Custom branding options</li>
                  <li>• API access for integrations</li>
                </ul>
              </div>
              <div className="mt-4 md:mt-0">
                <Link to="/pro-features">
                  <Button variant="primary">
                    Explore Pro Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;