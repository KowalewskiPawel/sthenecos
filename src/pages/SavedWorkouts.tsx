import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Clock, Target, Zap, Calendar, Filter, Search, Play, Eye } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getUserGeneratedWorkouts, getTrainerGeneratedWorkouts } from '../services/aiWorkoutGenerator';

interface SavedWorkout {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  fitness_level: string;
  goals: string[];
  equipment_needed: string[];
  workout_structure: any;
  created_at: string;
  user?: { name: string; email: string };
}

const SavedWorkouts: React.FC = () => {
  const { user, isTrainer } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterGoal, setFilterGoal] = useState<string>('');
  const [selectedWorkout, setSelectedWorkout] = useState<SavedWorkout | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const data = isTrainer() 
        ? await getTrainerGeneratedWorkouts(user.id)
        : await getUserGeneratedWorkouts(user.id);

      setWorkouts(data || []);
    } catch (err) {
      console.error('Error loading workouts:', err);
      setError('Failed to load saved workouts');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || workout.fitness_level === filterLevel;
    const matchesGoal = !filterGoal || workout.goals.some(goal => 
      goal.toLowerCase().includes(filterGoal.toLowerCase())
    );

    return matchesSearch && matchesLevel && matchesGoal;
  });

  const uniqueGoals = Array.from(new Set(workouts.flatMap(w => w.goals)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-text-secondary bg-background';
    }
  };

  const handleStartWorkout = (workoutId: string) => {
    console.log('Starting workout with ID:', workoutId);
    setSelectedWorkout(null);
    navigate(`/workout-session/${workoutId}`);
  };

  const handleWorkoutClick = (workoutId: string) => {
    console.log('Quick start workout:', workoutId);
    navigate(`/workout-session/${workoutId}`);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
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
          
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-text-primary">Saved Workouts</h1>
            <p className="text-text-secondary">
              {isTrainer() 
                ? 'AI-generated workouts created for your clients'
                : 'Your personal AI-generated workout collection'
              }
            </p>
          </div>

          <div className="text-sm text-text-secondary">
            {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 border border-background mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Fitness Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Goal
              </label>
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
              >
                <option value="">All Goals</option>
                {uniqueGoals.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterLevel('');
                  setFilterGoal('');
                }}
                className="w-full flex items-center justify-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Workouts Grid */}
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {workouts.length === 0 ? 'No Saved Workouts' : 'No Matching Workouts'}
            </h3>
            <p className="text-text-secondary mb-6">
              {workouts.length === 0 
                ? 'Start creating AI-generated workouts to see them here'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {workouts.length === 0 && (
              <Link to="/generate-workout">
                <Button variant="primary" className="flex items-center mx-auto">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate First Workout
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-card rounded-xl p-6 border border-background hover:border-primary transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                      {workout.title}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-2">
                      {workout.description}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.fitness_level)}`}>
                    {workout.fitness_level}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-text-secondary">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    {workout.duration_minutes} minutes
                  </div>
                  
                  <div className="flex items-center text-sm text-text-secondary">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    {workout.goals.slice(0, 2).join(', ')}
                    {workout.goals.length > 2 && ` +${workout.goals.length - 2} more`}
                  </div>

                  <div className="flex items-center text-sm text-text-secondary">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {formatDate(workout.created_at)}
                  </div>

                  {isTrainer() && workout.user && (
                    <div className="flex items-center text-sm text-text-secondary">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        <span className="text-primary text-xs font-bold">
                          {workout.user.name.charAt(0)}
                        </span>
                      </div>
                      {workout.user.name}
                    </div>
                  )}
                </div>

                {/* Exercise Preview */}
                <div className="mb-4 p-3 bg-background rounded-lg">
                  <div className="text-xs text-text-secondary mb-2">Exercise Preview:</div>
                  <div className="space-y-1">
                    {(workout.workout_structure?.mainWorkout || workout.workout_structure?.main_workout || []).slice(0, 3).map((exercise: any, index: number) => (
                      <div key={index} className="text-xs text-text-primary flex items-center">
                        <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-primary text-xs">
                          {index + 1}
                        </span>
                        {exercise.name}
                      </div>
                    ))}
                    {(workout.workout_structure?.mainWorkout || workout.workout_structure?.main_workout || []).length > 3 && (
                      <div className="text-xs text-text-secondary">
                        +{(workout.workout_structure?.mainWorkout || workout.workout_structure?.main_workout || []).length - 3} more exercises
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleWorkoutClick(workout.id)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    onClick={() => setSelectedWorkout(workout)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Workout Detail Modal */}
        {selectedWorkout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-background p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{selectedWorkout.title}</h2>
                    <p className="text-text-secondary">{selectedWorkout.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedWorkout(null)}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Workout Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-background p-4 rounded-lg text-center">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-text-primary">{selectedWorkout.duration_minutes}</p>
                    <p className="text-text-secondary text-sm">minutes</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg text-center">
                    <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-text-primary">{selectedWorkout.workout_structure?.mainWorkout?.length || selectedWorkout.workout_structure?.main_workout?.length || 0}</p>
                    <p className="text-text-secondary text-sm">exercises</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg text-center">
                    <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-text-primary">{selectedWorkout.workout_structure?.estimatedCalories || selectedWorkout.workout_structure?.estimated_calories || 0}</p>
                    <p className="text-text-secondary text-sm">calories</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg text-center">
                    <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-text-primary capitalize">{selectedWorkout.fitness_level}</p>
                    <p className="text-text-secondary text-sm">level</p>
                  </div>
                </div>

                {/* Exercise List */}
                {selectedWorkout.workout_structure && (
                  <div className="space-y-6">
                    {/* Warmup */}
                    {selectedWorkout.workout_structure.warmup && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Warm-up</h3>
                        <div className="space-y-3">
                          {selectedWorkout.workout_structure.warmup.map((exercise: any, index: number) => (
                            <div key={index} className="bg-background p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-medium text-text-primary">{exercise.name}</h4>
                                  <p className="text-text-secondary text-sm mt-1">{exercise.instructions}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                                    {exercise.sets && <span>Sets: {exercise.sets}</span>}
                                    {exercise.reps && <span>Reps: {exercise.reps}</span>}
                                    {exercise.duration && <span>Duration: {exercise.duration}s</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Workout */}
                    {(selectedWorkout.workout_structure.mainWorkout || selectedWorkout.workout_structure.main_workout) && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Main Workout</h3>
                        <div className="space-y-3">
                          {(selectedWorkout.workout_structure.mainWorkout || selectedWorkout.workout_structure.main_workout).map((exercise: any, index: number) => (
                            <div key={index} className="bg-background p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-medium text-text-primary">{exercise.name}</h4>
                                  <p className="text-text-secondary text-sm mt-1">{exercise.instructions}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                                    <span>Sets: {exercise.sets}</span>
                                    <span>Reps: {exercise.reps}</span>
                                    {exercise.restTime && <span>Rest: {exercise.restTime}s</span>}
                                  </div>
                                  {exercise.modifications && (
                                    <div className="text-xs text-text-secondary mt-2">
                                      <p><strong>Easier:</strong> {exercise.modifications.easier}</p>
                                      <p><strong>Harder:</strong> {exercise.modifications.harder}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cooldown */}
                    {selectedWorkout.workout_structure.cooldown && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Cool-down</h3>
                        <div className="space-y-3">
                          {selectedWorkout.workout_structure.cooldown.map((exercise: any, index: number) => (
                            <div key={index} className="bg-background p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-medium text-text-primary">{exercise.name}</h4>
                                  <p className="text-text-secondary text-sm mt-1">{exercise.instructions}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                                    {exercise.sets && <span>Sets: {exercise.sets}</span>}
                                    {exercise.reps && <span>Reps: {exercise.reps}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-4 mt-8">
                  <Button 
                    variant="primary" 
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleStartWorkout(selectedWorkout.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start This Workout
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedWorkout(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedWorkouts;