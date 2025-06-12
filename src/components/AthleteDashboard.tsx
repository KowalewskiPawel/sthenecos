import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  Play,
  BarChart3,
  Zap,
  Brain,
  Users,
  Puzzle,
  Camera,
  Trophy,
  Bookmark,
  Dumbbell
} from 'lucide-react';

const AthleteDashboard: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Start AI Conversation',
      description: 'Chat with your personalized AI trainer',
      icon: <MessageSquare className="h-6 w-6" />,
      link: '/chat',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      title: 'Generate AI Workout',
      description: 'Create a personalized workout with AI',
      icon: <Brain className="h-6 w-6" />,
      link: '/generate-workout',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      title: 'Saved Workouts',
      description: 'View your AI-generated workout collection',
      icon: <Bookmark className="h-6 w-6" />,
      link: '/saved-workouts',
      color: 'bg-green-500/10 text-green-400 border-green-500/20'
    },
    {
      title: 'Browse Programs',
      description: 'Explore our workout program library',
      icon: <Play className="h-6 w-6" />,
      link: '/workouts',
      color: 'bg-primary/10 text-primary border-primary/20'
    },
    {
      title: 'Analyze Form',
      description: 'Get AI feedback on your exercise form',
      icon: <Camera className="h-6 w-6" />,
      link: '/form-analysis',
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    },
    {
      title: 'Progress Tracker',
      description: 'Monitor your fitness journey',
      icon: <BarChart3 className="h-6 w-6" />,
      link: '/progress',
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    }
  ];

  const recentActivity = [
    {
      type: 'workout',
      title: 'Full Body Strength',
      time: '2 hours ago',
      score: 85
    },
    {
      type: 'chat',
      title: 'Chat with Carter',
      time: '1 day ago',
      score: null
    },
    {
      type: 'form',
      title: 'Squat Form Analysis',
      time: '2 days ago',
      score: 92
    }
  ];

  const achievements = [
    {
      title: '7-Day Streak',
      description: 'Worked out 7 days in a row',
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      unlocked: true
    },
    {
      title: 'Form Master',
      description: 'Achieved 90+ form score',
      icon: <Target className="h-6 w-6 text-primary" />,
      unlocked: true
    },
    {
      title: 'AI Enthusiast',
      description: 'Completed 10 AI-generated workouts',
      icon: <Brain className="h-6 w-6 text-purple-400" />,
      unlocked: false
    }
  ];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Welcome back, {user?.name}! 💪
              </h1>
              <p className="text-text-secondary">
                Ready to crush your fitness goals? Here's your personalized athlete dashboard.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-primary/10 border border-primary rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <p className="text-primary font-medium text-sm">Athlete Mode</p>
                    <p className="text-text-secondary text-xs">Training & Progress Focus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-text-primary">7 days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Workouts This Week</p>
                <p className="text-2xl font-bold text-text-primary">4</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Avg Form Score</p>
                <p className="text-2xl font-bold text-text-primary">89</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Plan</p>
                <p className="text-2xl font-bold text-text-primary">
                  {user?.subscription_tier?.charAt(0).toUpperCase() + user?.subscription_tier?.slice(1)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

            {/* Recent Activity */}
            <div className="bg-card rounded-xl p-6 border border-background">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-background last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        {activity.type === 'workout' && <Play className="h-5 w-5 text-primary" />}
                        {activity.type === 'chat' && <MessageSquare className="h-5 w-5 text-primary" />}
                        {activity.type === 'form' && <Target className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">{activity.title}</p>
                        <p className="text-text-secondary text-xs">{activity.time}</p>
                      </div>
                    </div>
                    {activity.score && (
                      <div className="text-right">
                        <p className="text-primary font-medium text-sm">{activity.score}%</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Link to="/progress" className="block mt-4">
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Achievements */}
            <div className="bg-card rounded-xl p-6 border border-background mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Achievements</h3>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center p-3 rounded-lg ${
                    achievement.unlocked ? 'bg-primary/10 border border-primary' : 'bg-background border border-background'
                  }`}>
                    <div className="mr-3">
                      {achievement.unlocked ? achievement.icon : (
                        <div className="w-6 h-6 rounded-full bg-text-secondary/20 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-text-secondary/50"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className={`font-medium text-sm ${achievement.unlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {achievement.title}
                      </p>
                      <p className="text-text-secondary text-xs">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/achievements" className="block mt-4">
                <Button variant="outline" className="w-full text-sm">
                  View All Achievements
                </Button>
              </Link>
            </div>

            {/* AI Training Assistant */}
            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl p-6 border border-primary">
              <div className="text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  AI Training Assistant
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Get personalized workout recommendations and form feedback powered by AI
                </p>
                <div className="space-y-2">
                  <Link to="/chat">
                    <Button variant="primary" className="w-full">
                      Chat with AI Trainer
                    </Button>
                  </Link>
                  <Link to="/generate-workout">
                    <Button variant="outline" className="w-full">
                      Generate Workout
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA for Free Users */}
        {user?.subscription_tier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-6 border border-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Unlock Premium Features
                </h3>
                <p className="text-text-secondary">
                  Get unlimited AI conversations, advanced form analysis, and custom workout programs.
                </p>
                <ul className="text-text-secondary text-sm mt-2 space-y-1">
                  <li>• Unlimited AI trainer conversations</li>
                  <li>• Advanced form analysis with detailed feedback</li>
                  <li>• Custom workout program creation</li>
                  <li>• Progress analytics and insights</li>
                </ul>
              </div>
              <div className="mt-4 md:mt-0">
                <Link to="/pricing">
                  <Button variant="primary">
                    Upgrade Now
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

export default AthleteDashboard;