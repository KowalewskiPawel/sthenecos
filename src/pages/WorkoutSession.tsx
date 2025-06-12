import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle, Clock, Target, Timer, Award, RotateCcw } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getUserGeneratedWorkouts } from '../services/aiWorkoutGenerator';

interface Exercise {
  name: string;
  instructions: string;
  sets: number;
  reps: string;
  restTime?: number;
  duration?: number;
  muscleGroups: string[];
  modifications?: {
    easier: string;
    harder: string;
  };
}

interface WorkoutData {
  id: string;
  title: string;
  description: string;
  totalDuration: number;
  warmup: Exercise[];
  mainWorkout: Exercise[];
  cooldown: Exercise[];
  estimatedCalories: number;
  notes: string[];
}

const WorkoutSession: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<'warmup' | 'main' | 'cooldown'>('warmup');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying && workoutStarted) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }
      
      interval = setInterval(() => {
        if (isResting) {
          setTimer(prev => {
            if (prev <= 1) {
              setIsResting(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setSessionDuration(prev => prev + 1);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isResting, sessionStartTime, workoutStarted]);

  const loadWorkout = async () => {
    if (!user || !workoutId) {
      setError('User not authenticated or no workout ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading workout with ID:', workoutId);
      const workouts = await getUserGeneratedWorkouts(user.id);
      console.log('Available workouts:', workouts);
      
      const foundWorkout = workouts.find((w: any) => w.id === workoutId);
      
      if (foundWorkout && foundWorkout.workout_structure) {
        console.log('Found workout:', foundWorkout);
        const structure = foundWorkout.workout_structure;
        
        setWorkout({
          id: foundWorkout.id,
          title: foundWorkout.title,
          description: foundWorkout.description,
          totalDuration: foundWorkout.duration_minutes,
          warmup: structure.warmup || [],
          mainWorkout: structure.mainWorkout || structure.main_workout || [],
          cooldown: structure.cooldown || [],
          estimatedCalories: structure.estimatedCalories || structure.estimated_calories || 0,
          notes: structure.notes || []
        });
      } else {
        console.error('Workout not found or invalid structure:', foundWorkout);
        setError('Workout not found or has invalid structure');
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      setError('Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentExercises = () => {
    if (!workout) return [];
    switch (currentSection) {
      case 'warmup': return workout.warmup;
      case 'main': return workout.mainWorkout;
      case 'cooldown': return workout.cooldown;
      default: return [];
    }
  };

  const getCurrentExercise = () => {
    const exercises = getCurrentExercises();
    return exercises[currentExerciseIndex] || null;
  };

  const getTotalExercises = () => {
    if (!workout) return 0;
    return workout.warmup.length + workout.mainWorkout.length + workout.cooldown.length;
  };

  const getCompletedCount = () => {
    return completedExercises.size;
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setIsPlaying(true);
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
  };

  const pauseWorkout = () => {
    setIsPlaying(false);
  };

  const resumeWorkout = () => {
    setIsPlaying(true);
  };

  const startRestTimer = (seconds: number) => {
    setTimer(seconds);
    setIsResting(true);
  };

  const completeSet = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      if (currentExercise.restTime && currentExercise.restTime > 0) {
        startRestTimer(currentExercise.restTime);
      }
    } else {
      completeExercise();
    }
  };

  const completeExercise = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    const exerciseKey = `${currentSection}-${currentExerciseIndex}`;
    setCompletedExercises(prev => new Set([...prev, exerciseKey]));
    setCurrentSet(1);
    
    nextExercise();
  };

  const nextExercise = () => {
    const exercises = getCurrentExercises();
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Move to next section
      if (currentSection === 'warmup' && workout?.mainWorkout.length > 0) {
        setCurrentSection('main');
        setCurrentExerciseIndex(0);
      } else if (currentSection === 'main' && workout?.cooldown.length > 0) {
        setCurrentSection('cooldown');
        setCurrentExerciseIndex(0);
      } else {
        // Workout complete
        completeWorkout();
      }
    }
  };

  const skipExercise = () => {
    completeExercise();
  };

  const restartWorkout = () => {
    setCurrentSection('warmup');
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setIsPlaying(false);
    setIsResting(false);
    setTimer(0);
    setCompletedExercises(new Set());
    setSessionDuration(0);
    setSessionStartTime(null);
    setWorkoutStarted(false);
  };

  const completeWorkout = () => {
    setIsPlaying(false);
    setWorkoutStarted(false);
    
    // Navigate back to dashboard with completion message
    navigate('/dashboard', { 
      state: { 
        message: 'Workout completed! Great job!',
        stats: {
          duration: Math.floor(sessionDuration / 60),
          exercisesCompleted: getCompletedCount(),
          totalExercises: getTotalExercises(),
          estimatedCalories: workout?.estimatedCalories || 0
        }
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSectionProgress = () => {
    const exercises = getCurrentExercises();
    return exercises.length > 0 ? ((currentExerciseIndex + 1) / exercises.length) * 100 : 0;
  };

  const getTotalProgress = () => {
    if (!workout) return 0;
    const totalExercises = getTotalExercises();
    let currentPosition = 0;
    
    if (currentSection === 'warmup') {
      currentPosition = currentExerciseIndex;
    } else if (currentSection === 'main') {
      currentPosition = workout.warmup.length + currentExerciseIndex;
    } else if (currentSection === 'cooldown') {
      currentPosition = workout.warmup.length + workout.mainWorkout.length + currentExerciseIndex;
    }
    
    return totalExercises > 0 ? (currentPosition / totalExercises) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {error || 'Workout Not Found'}
          </h1>
          <p className="text-text-secondary mb-6">
            {error || "The workout you're looking for doesn't exist or has been removed."}
          </p>
          <div className="space-x-4">
            <Link to="/saved-workouts">
              <Button variant="primary">View Saved Workouts</Button>
            </Link>
            <Link to="/generate-workout">
              <Button variant="outline">Generate New Workout</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = getCurrentExercise();
  const exercises = getCurrentExercises();

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/saved-workouts" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-text-primary">{workout.title}</h1>
            <p className="text-text-secondary">{workout.description}</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-text-secondary">Session Time</div>
            <div className="text-xl font-bold text-primary">{formatTime(sessionDuration)}</div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-card rounded-xl p-6 border border-background mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary capitalize">{currentSection} Section</h2>
              <p className="text-text-secondary">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">Overall Progress</div>
              <div className="text-lg font-bold text-primary">
                {Math.round(getTotalProgress())}%
              </div>
            </div>
          </div>

          <div className="w-full bg-background rounded-full h-3 mb-4">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${getTotalProgress()}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentSection === 'warmup' ? 'bg-primary text-background' : 'bg-background text-text-secondary'
            }`}>
              Warm-up ({workout.warmup.length})
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentSection === 'main' ? 'bg-primary text-background' : 'bg-background text-text-secondary'
            }`}>
              Main Workout ({workout.mainWorkout.length})
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentSection === 'cooldown' ? 'bg-primary text-background' : 'bg-background text-text-secondary'
            }`}>
              Cool-down ({workout.cooldown.length})
            </div>
          </div>
        </div>

        {/* Rest Timer */}
        {isResting && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-6 text-center mb-6">
            <Timer className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">Rest Time</h3>
            <div className="text-4xl font-bold text-yellow-400 mb-4">{formatTime(timer)}</div>
            <p className="text-text-secondary">Take a breather and prepare for the next set</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                setIsResting(false);
                setTimer(0);
              }}
            >
              Skip Rest
            </Button>
          </div>
        )}

        {/* Pre-workout Start Screen */}
        {!workoutStarted && !isResting && (
          <div className="bg-card rounded-xl p-8 border border-background mb-6 text-center">
            <Target className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-text-primary mb-4">Ready to Start?</h3>
            <p className="text-text-secondary mb-6">
              Your {workout.totalDuration}-minute workout is ready. You'll start with the warm-up section.
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{workout.warmup.length}</div>
                <div className="text-xs text-text-secondary">Warm-up</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{workout.mainWorkout.length}</div>
                <div className="text-xs text-text-secondary">Main</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{workout.cooldown.length}</div>
                <div className="text-xs text-text-secondary">Cool-down</div>
              </div>
            </div>
            
            <Button variant="primary" size="lg" onClick={startWorkout}>
              <Play className="h-5 w-5 mr-2" />
              Start Workout
            </Button>
          </div>
        )}

        {/* Current Exercise */}
        {currentExercise && workoutStarted && !isResting && (
          <div className="bg-card rounded-xl p-6 border border-background mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-text-primary mb-2">{currentExercise.name}</h3>
                <p className="text-text-secondary mb-4">{currentExercise.instructions}</p>
                
                <div className="flex items-center space-x-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentSet}</div>
                    <div className="text-sm text-text-secondary">of {currentExercise.sets} sets</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentExercise.reps}</div>
                    <div className="text-sm text-text-secondary">reps</div>
                  </div>
                  
                  {currentExercise.restTime && currentExercise.restTime > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{currentExercise.restTime}s</div>
                      <div className="text-sm text-text-secondary">rest</div>
                    </div>
                  )}
                </div>

                {currentExercise.muscleGroups && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentExercise.muscleGroups.map((muscle, index) => (
                      <span key={index} className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                        {muscle}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Exercise Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                variant="outline"
                onClick={skipExercise}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip Exercise
              </Button>
              
              <Button
                variant="secondary"
                onClick={isPlaying ? pauseWorkout : resumeWorkout}
                className="flex items-center"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button
                variant="primary"
                onClick={completeSet}
                disabled={!isPlaying}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Set
              </Button>
            </div>

            {/* Modifications */}
            {currentExercise.modifications && (
              <div className="bg-background rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-3">Exercise Modifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-400 font-medium mb-1">Easier:</p>
                    <p className="text-text-secondary">{currentExercise.modifications.easier}</p>
                  </div>
                  <div>
                    <p className="text-red-400 font-medium mb-1">Harder:</p>
                    <p className="text-text-secondary">{currentExercise.modifications.harder}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workout Controls */}
        {workoutStarted && (
          <div className="bg-card rounded-xl p-4 border border-background mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                Workout Controls
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={restartWorkout}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restart
                </Button>
                <Button variant="outline" size="sm" onClick={completeWorkout}>
                  Finish Early
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Workout Notes */}
        {workout.notes.length > 0 && (
          <div className="bg-primary/10 border border-primary rounded-xl p-4">
            <h4 className="font-medium text-text-primary mb-2">Important Notes</h4>
            <ul className="space-y-1">
              {workout.notes.map((note, index) => (
                <li key={index} className="text-text-secondary text-sm flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutSession;