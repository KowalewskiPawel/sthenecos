import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { workoutService, WorkoutProgram } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { Play, Clock, Users, Star, Filter, Search, Dumbbell, Crown, Info, Target, Calendar, AlertTriangle, Loader } from 'lucide-react';

const WorkoutLibrary: React.FC = () => {
  const { user, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isPremium, setIsPremium] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [startingProgram, setStartingProgram] = useState<string | null>(null);
  const [programError, setProgramError] = useState<string | null>(null);

  const categories = ['all', 'strength', 'cardio', 'hiit', 'yoga', 'flexibility'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadPrograms();
    checkUserSubscription();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await workoutService.getPrograms();
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserSubscription = async () => {
    const premium = await checkSubscription();
    setIsPremium(premium);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || program.difficulty_level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const isAccessible = (program: WorkoutProgram) => {
    if (isPremium) return true;
    return program.price === 0; // Free programs only for free users
  };

  const handleStartProgram = async (program: WorkoutProgram) => {
    console.log('Starting program:', program.title);
    setProgramError(null);
    
    if (!isAccessible(program)) {
      // Redirect to pricing if not accessible
      navigate('/pricing');
      return;
    }

    setStartingProgram(program.id);

    try {
      // Get the workouts for this program
      console.log('Fetching workouts for program:', program.id);
      const workouts = await workoutService.getProgramWorkouts(program.id);
      console.log('Found workouts:', workouts);
      
      if (workouts && workouts.length > 0) {
        // Sort workouts by week and day to get the first workout
        const sortedWorkouts = workouts.sort((a, b) => {
          if (a.week_number !== b.week_number) {
            return a.week_number - b.week_number;
          }
          return a.day_number - b.day_number;
        });
        
        const firstWorkout = sortedWorkouts[0];
        console.log('Starting first workout:', firstWorkout);
        
        // Close the modal first
        setSelectedProgram(null);
        
        // Navigate to the first workout session
        navigate(`/workout-session/${firstWorkout.id}`, {
          state: { 
            programId: program.id,
            programTitle: program.title,
            isFirstWorkout: true 
          }
        });
      } else {
        // No workouts found in this program
        setProgramError(`This program doesn't have any workouts available yet. Please try another program or contact support.`);
        console.warn('No workouts found for program:', program.id);
      }
    } catch (error) {
      console.error('Error starting program:', error);
      setProgramError(`Failed to load program workouts. Please try again or contact support.`);
    } finally {
      setStartingProgram(null);
    }
  };

  const handleViewDetails = (program: WorkoutProgram) => {
    setProgramError(null);
    setSelectedProgram(program);
  };

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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Workout Library</h1>
          <p className="text-text-secondary">
            {isPremium ? 'Access all premium workout programs' : 'Free programs available, upgrade for full access'}
          </p>
        </div>
        
        {!isPremium && (
          <Button variant="primary" className="mt-4 md:mt-0" onClick={() => navigate('/pricing')}>
            Upgrade to Premium
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-6 mb-8 border border-background">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <div
            key={program.id}
            className={`bg-card rounded-xl overflow-hidden border transition-all duration-300 hover:border-primary ${
              isAccessible(program) ? 'border-background' : 'border-background opacity-60'
            }`}
          >
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-background">
              <div className="absolute inset-0 flex items-center justify-center">
                <Dumbbell className="h-16 w-16 text-primary/50" />
              </div>
              
              {!isAccessible(program) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Crown className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Premium Only</p>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  program.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  program.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {program.difficulty_level}
                </span>
              </div>
              
              {program.price > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-primary text-background px-3 py-1 rounded-full text-xs font-medium">
                    ${program.price}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">{program.title}</h3>
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                {program.description}
              </p>

              <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{program.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{program.workouts_per_week}x/week</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-primary" />
                  <span>4.8</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={isAccessible(program) ? "primary" : "outline"}
                  className="flex-1 flex items-center justify-center"
                  onClick={() => handleStartProgram(program)}
                  disabled={startingProgram === program.id}
                >
                  {startingProgram === program.id ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {isAccessible(program) ? 'Start Program' : 'Upgrade for Access'}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() => handleViewDetails(program)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No programs found</h3>
          <p className="text-text-secondary">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-background p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">{selectedProgram.title}</h2>
                  <p className="text-text-secondary">{selectedProgram.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProgram(null);
                    setProgramError(null);
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Error Message */}
              {programError && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-200 text-sm">{programError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Program Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-background p-4 rounded-lg text-center">
                  <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-text-primary">{selectedProgram.duration_weeks}</p>
                  <p className="text-text-secondary text-sm">weeks</p>
                </div>
                <div className="bg-background p-4 rounded-lg text-center">
                  <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-text-primary">{selectedProgram.workouts_per_week}</p>
                  <p className="text-text-secondary text-sm">per week</p>
                </div>
                <div className="bg-background p-4 rounded-lg text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-text-primary capitalize">{selectedProgram.difficulty_level}</p>
                  <p className="text-text-secondary text-sm">level</p>
                </div>
                <div className="bg-background p-4 rounded-lg text-center">
                  <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-text-primary">${selectedProgram.price}</p>
                  <p className="text-text-secondary text-sm">price</p>
                </div>
              </div>

              {/* Equipment Needed */}
              {selectedProgram.equipment_needed && selectedProgram.equipment_needed.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Equipment Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.equipment_needed.map((equipment, index) => (
                      <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button 
                  variant="primary" 
                  className="flex-1 flex items-center justify-center"
                  onClick={() => handleStartProgram(selectedProgram)}
                  disabled={!isAccessible(selectedProgram) || startingProgram === selectedProgram.id}
                >
                  {startingProgram === selectedProgram.id ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Starting Program...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {isAccessible(selectedProgram) ? 'Start Program' : 'Upgrade Required'}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedProgram(null);
                  setProgramError(null);
                }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLibrary;