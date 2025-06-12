import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { workoutService, UserProgress } from '../services/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Target, Award, Clock, Flame } from 'lucide-react';

const ProgressTracker: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user, timeRange]);

  const loadProgress = async () => {
    if (!user) return;
    
    try {
      const data = await workoutService.getUserProgress(user.id);
      setProgress(data || []);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressStats = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
    
    const recentProgress = progress.filter(p => new Date(p.completed_at) >= daysAgo);
    
    const totalWorkouts = recentProgress.length;
    const totalMinutes = recentProgress.reduce((sum, p) => sum + p.duration_minutes, 0);
    const totalCalories = recentProgress.reduce((sum, p) => sum + (p.calories_burned || 0), 0);
    const averageFormScore = recentProgress.length > 0 
      ? recentProgress.reduce((sum, p) => sum + (p.form_score || 0), 0) / recentProgress.length
      : 0;

    // Calculate weekly data for chart
    const weeklyData = [];
    for (let i = 0; i < parseInt(timeRange); i += 7) {
      const weekStart = new Date(now.getTime() - (i + 7) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      const weekWorkouts = recentProgress.filter(p => {
        const date = new Date(p.completed_at);
        return date >= weekStart && date < weekEnd;
      });
      
      weeklyData.unshift({
        week: `Week ${Math.floor(i / 7) + 1}`,
        workouts: weekWorkouts.length,
        minutes: weekWorkouts.reduce((sum, p) => sum + p.duration_minutes, 0),
        formScore: weekWorkouts.length > 0 
          ? weekWorkouts.reduce((sum, p) => sum + (p.form_score || 0), 0) / weekWorkouts.length 
          : 0
      });
    }

    return {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      averageFormScore,
      weeklyData: weeklyData.slice(-4) // Last 4 weeks
    };
  };

  const stats = getProgressStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Progress Tracker</h1>
          <p className="text-text-secondary">Track your fitness journey and improvements</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="mt-4 md:mt-0 px-4 py-2 bg-card border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-background">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Total Workouts</p>
              <p className="text-3xl font-bold text-text-primary">{stats.totalWorkouts}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-background">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Total Time</p>
              <p className="text-3xl font-bold text-text-primary">{Math.round(stats.totalMinutes / 60)}h</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-background">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Calories Burned</p>
              <p className="text-3xl font-bold text-text-primary">{stats.totalCalories.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Flame className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-background">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Avg Form Score</p>
              <p className="text-3xl font-bold text-text-primary">{Math.round(stats.averageFormScore)}/100</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Workout Frequency */}
        <div className="bg-card rounded-xl p-6 border border-background">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Workout Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Bar dataKey="workouts" fill="#D6FF00" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Form Score Improvement */}
        <div className="bg-card rounded-xl p-6 border border-background">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Form Score Improvement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="formScore" 
                stroke="#D6FF00" 
                strokeWidth={3}
                dot={{ fill: '#D6FF00', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-card rounded-xl p-6 border border-background">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Workouts</h3>
        
        {progress.length > 0 ? (
          <div className="space-y-4">
            {progress.slice(0, 10).map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Workout Session</h4>
                    <p className="text-sm text-text-secondary">
                      {new Date(workout.completed_at).toLocaleDateString()} • {workout.duration_minutes} min
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {workout.exercises_completed}/{workout.total_exercises} exercises
                  </p>
                  {workout.form_score && (
                    <p className="text-sm text-text-secondary">
                      Form Score: {workout.form_score}/100
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No workouts yet</h3>
            <p className="text-text-secondary">Start your first workout to see your progress here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;