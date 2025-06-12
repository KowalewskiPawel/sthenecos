import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateAIWorkout, WorkoutGoals, GeneratedWorkout } from '../services/aiWorkoutGenerator';
import Button from '../components/ui/Button';
import { 
  Brain, 
  Clock, 
  Target, 
  Zap, 
  Users, 
  Play, 
  CheckCircle,
  ArrowLeft,
  Save,
  Share2,
  Crown,
  Copy,
  Check,
  X,
  Edit,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const WorkoutGenerator: React.FC = () => {
  const { user, isTrainer } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  
  const [goals, setGoals] = useState<WorkoutGoals>({
    primary: '',
    secondary: [],
    timeAvailable: 30,
    fitnessLevel: 'intermediate',
    equipment: ['bodyweight'],
    targetMuscles: [],
    workoutType: 'mixed'
  });

  // Mock client data for trainers - in real app, this would come from DB
  const mockClients = [
    { id: '1', name: 'Sarah Johnson', level: 'beginner' },
    { id: '2', name: 'Mike Chen', level: 'intermediate' },
    { id: '3', name: 'Emma Rodriguez', level: 'advanced' }
  ];

  const primaryGoals = [
    'Build Muscle',
    'Lose Weight', 
    'Improve Strength',
    'Increase Endurance',
    'Better Flexibility',
    'Athletic Performance',
    'General Fitness'
  ];

  const equipmentOptions = [
    'bodyweight',
    'dumbbells',
    'resistance bands',
    'kettlebells',
    'barbell',
    'exercise ball',
    'pull-up bar',
    'yoga mat'
  ];

  const targetMuscleGroups = [
    'chest',
    'back',
    'shoulders',
    'arms',
    'core',
    'legs',
    'glutes'
  ];

  const handleGenerate = async () => {
    if (!user) return;
    
    setGenerating(true);
    
    try {
      const userId = isTrainer() && selectedClient ? selectedClient : user.id;
      const trainerId = isTrainer() ? user.id : undefined;
      
      console.log('Generating workout for:', { userId, trainerId, goals });
      
      const workout = await generateAIWorkout(goals, userId, trainerId);
      console.log('Generated workout:', workout);
      
      setGeneratedWorkout(workout);
      setStep(3); // Go to review step
    } catch (error) {
      console.error('Error generating workout:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveWorkout = async () => {
    if (!generatedWorkout) return;
    
    setSaving(true);
    
    try {
      // The workout is already saved during generation, so we just mark it as approved
      setSaveSuccess(true);
      setStep(4); // Go to success step
    } catch (error) {
      console.error('Error approving workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRejectWorkout = async () => {
    setRejecting(true);
    
    try {
      // Delete the generated workout if user rejects it
      // In a real app, you'd call an API to delete the workout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGeneratedWorkout(null);
      setStep(2); // Go back to goals step to regenerate
    } catch (error) {
      console.error('Error rejecting workout:', error);
    } finally {
      setRejecting(false);
    }
  };

  const handleShareWorkout = async () => {
    if (!generatedWorkout) return;
    
    setSharing(true);
    
    try {
      const shareData = {
        title: `${generatedWorkout.title} - Stheneco Workout`,
        text: `Check out this AI-generated workout: ${generatedWorkout.description}`,
        url: window.location.href
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareSuccess(true);
      } else {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\nGenerated on Stheneco: ${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
      }
    } catch (error) {
      console.error('Error sharing workout:', error);
      try {
        const fallbackText = `${generatedWorkout.title} - AI-generated workout from Stheneco`;
        await navigator.clipboard.writeText(fallbackText);
        setShareSuccess(true);
      } catch (clipboardError) {
        console.error('Clipboard fallback also failed:', clipboardError);
      }
    } finally {
      setSharing(false);
      if (shareSuccess) {
        setTimeout(() => setShareSuccess(false), 3000);
      }
    }
  };

  const handleViewSavedWorkouts = () => {
    navigate('/saved-workouts');
  };

  const handleStartWorkout = () => {
    if (generatedWorkout?.id) {
      navigate(`/workout-session/${generatedWorkout.id}`);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">AI Workout Generator</h2>
              <p className="text-text-secondary">
                {isTrainer() 
                  ? 'Create personalized workouts for your clients using AI'
                  : 'Tell us your goals and we\'ll create a personalized workout just for you'
                }
              </p>
              
              <div className="mt-4 bg-primary/10 border border-primary rounded-lg p-4">
                <div className="flex items-center justify-center">
                  {isTrainer() ? (
                    <>
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span className="text-primary font-medium">Trainer Mode:</span>
                      <span className="text-text-secondary ml-1">Create workouts for clients</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-5 w-5 text-primary mr-2" />
                      <span className="text-primary font-medium">Athlete Mode:</span>
                      <span className="text-text-secondary ml-1">Personalized for your goals</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isTrainer() && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Generate workout for:
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedClient('')}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedClient === ''
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-background text-text-secondary hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center">
                      <Target className="h-5 w-5 mr-3" />
                      <div>
                        <p className="font-medium">Myself</p>
                        <p className="text-sm">Personal training workout</p>
                      </div>
                    </div>
                  </button>
                  
                  {mockClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client.id)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedClient === client.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-background text-text-secondary hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3" />
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm">{client.level} level client</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Primary Goal
              </label>
              <div className="grid grid-cols-2 gap-3">
                {primaryGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => setGoals(prev => ({ ...prev, primary: goal }))}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      goals.primary === goal
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-background text-text-secondary hover:border-primary'
                    }`}
                  >
                    <Target className="h-6 w-6 mx-auto mb-2" />
                    <span className="font-medium">{goal}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Workout Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { type: 'strength', label: 'Strength', icon: '💪' },
                  { type: 'cardio', label: 'Cardio', icon: '❤️' },
                  { type: 'hiit', label: 'HIIT', icon: '🔥' },
                  { type: 'flexibility', label: 'Flexibility', icon: '🧘' },
                  { type: 'mixed', label: 'Mixed', icon: '⚡' }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => setGoals(prev => ({ ...prev, workoutType: type as any }))}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      goals.workoutType === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-background text-text-secondary hover:border-primary'
                    }`}
                  >
                    <div className="text-2xl mb-1">{icon}</div>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Time Available
                </label>
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="15"
                    value={goals.timeAvailable}
                    onChange={(e) => setGoals(prev => ({ ...prev, timeAvailable: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-text-primary font-medium w-16">{goals.timeAvailable} min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Fitness Level
                </label>
                <select
                  value={goals.fitnessLevel}
                  onChange={(e) => setGoals(prev => ({ ...prev, fitnessLevel: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Equipment & Preferences</h2>
              <p className="text-text-secondary">
                {isTrainer() && selectedClient 
                  ? 'Configure equipment and preferences for your client'
                  : 'Let us know what equipment you have available'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Available Equipment (select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipmentOptions.map(equipment => (
                  <button
                    key={equipment}
                    onClick={() => {
                      const isSelected = goals.equipment.includes(equipment);
                      setGoals(prev => ({
                        ...prev,
                        equipment: isSelected 
                          ? prev.equipment.filter(e => e !== equipment)
                          : [...prev.equipment, equipment]
                      }));
                    }}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      goals.equipment.includes(equipment)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-background text-text-secondary hover:border-primary'
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">{equipment}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Target Muscle Groups (optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {targetMuscleGroups.map(muscle => (
                  <button
                    key={muscle}
                    onClick={() => {
                      const isSelected = goals.targetMuscles?.includes(muscle);
                      setGoals(prev => ({
                        ...prev,
                        targetMuscles: isSelected 
                          ? prev.targetMuscles?.filter(m => m !== muscle) || []
                          : [...(prev.targetMuscles || []), muscle]
                      }));
                    }}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      goals.targetMuscles?.includes(muscle)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-background text-text-secondary hover:border-primary'
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">{muscle}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-background">
              <h3 className="font-semibold text-text-primary mb-4">
                {isTrainer() && selectedClient ? 'Client Workout Summary' : 'Your Workout Summary'}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">Primary Goal:</p>
                  <p className="text-text-primary font-medium">{goals.primary}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Workout Type:</p>
                  <p className="text-text-primary font-medium capitalize">{goals.workoutType}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Duration:</p>
                  <p className="text-text-primary font-medium">{goals.timeAvailable} minutes</p>
                </div>
                <div>
                  <p className="text-text-secondary">Fitness Level:</p>
                  <p className="text-text-primary font-medium capitalize">{goals.fitnessLevel}</p>
                </div>
              </div>
              {isTrainer() && selectedClient && (
                <div className="mt-4 pt-4 border-t border-background">
                  <p className="text-text-secondary text-sm">
                    Creating workout for: <span className="text-primary font-medium">
                      {mockClients.find(c => c.id === selectedClient)?.name || 'Selected Client'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return generatedWorkout && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Eye className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Review Your Workout</h2>
              <p className="text-text-secondary mb-4">{generatedWorkout.description}</p>
              
              <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-400 font-medium">Please review and approve this workout before saving</span>
                </div>
              </div>
            </div>

            {/* Workout Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-background text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">{generatedWorkout.totalDuration}</p>
                <p className="text-text-secondary text-sm">minutes</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-background text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">{generatedWorkout.mainWorkout.length}</p>
                <p className="text-text-secondary text-sm">exercises</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-background text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">{generatedWorkout.estimatedCalories}</p>
                <p className="text-text-secondary text-sm">calories</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-background text-center">
                <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary capitalize">{generatedWorkout.difficulty}</p>
                <p className="text-text-secondary text-sm">level</p>
              </div>
            </div>

            {/* Workout Preview */}
            <div className="space-y-6">
              {/* Warmup Preview */}
              <div className="bg-card rounded-lg p-6 border border-background">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Warm-up ({generatedWorkout.warmup.length} exercises)</h3>
                <div className="space-y-3">
                  {generatedWorkout.warmup.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-text-primary text-sm">{exercise.name}</h4>
                        <p className="text-xs text-text-secondary">
                          {exercise.sets && `${exercise.sets} sets`} 
                          {exercise.reps && ` • ${exercise.reps}`}
                          {exercise.duration && ` • ${exercise.duration}s`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {generatedWorkout.warmup.length > 3 && (
                    <p className="text-sm text-text-secondary text-center">
                      +{generatedWorkout.warmup.length - 3} more warm-up exercises
                    </p>
                  )}
                </div>
              </div>

              {/* Main Workout Preview */}
              <div className="bg-card rounded-lg p-6 border border-background">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Main Workout ({generatedWorkout.mainWorkout.length} exercises)</h3>
                <div className="space-y-3">
                  {generatedWorkout.mainWorkout.slice(0, 4).map((exercise, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-text-primary text-sm">{exercise.name}</h4>
                        <p className="text-xs text-text-secondary">
                          {exercise.sets} sets • {exercise.reps} • {exercise.restTime}s rest
                        </p>
                      </div>
                    </div>
                  ))}
                  {generatedWorkout.mainWorkout.length > 4 && (
                    <p className="text-sm text-text-secondary text-center">
                      +{generatedWorkout.mainWorkout.length - 4} more main exercises
                    </p>
                  )}
                </div>
              </div>

              {/* Cooldown Preview */}
              <div className="bg-card rounded-lg p-6 border border-background">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Cool-down ({generatedWorkout.cooldown.length} exercises)</h3>
                <div className="space-y-3">
                  {generatedWorkout.cooldown.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-text-primary text-sm">{exercise.name}</h4>
                        <p className="text-xs text-text-secondary">
                          {exercise.sets && `${exercise.sets} sets`} 
                          {exercise.reps && ` • ${exercise.reps}`}
                          {exercise.duration && ` • ${exercise.duration}s`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {generatedWorkout.cooldown.length > 3 && (
                    <p className="text-sm text-text-secondary text-center">
                      +{generatedWorkout.cooldown.length - 3} more cool-down exercises
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="bg-primary/10 border border-primary rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
                Do you want to save this workout?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="primary" 
                  className="flex-1 flex items-center justify-center"
                  onClick={handleApproveWorkout}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Yes, Save Workout
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1 flex items-center justify-center"
                  onClick={handleRejectWorkout}
                  disabled={rejecting}
                >
                  {rejecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-text-primary mr-2"></div>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      No, Generate New One
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-text-secondary text-sm text-center mt-4">
                If you approve, the workout will be saved and you can start training immediately.
              </p>
            </div>
          </div>
        );

      case 4:
        return generatedWorkout && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">{generatedWorkout.title}</h2>
              <p className="text-text-secondary">{generatedWorkout.description}</p>
              
              {saveSuccess && (
                <div className="mt-4 bg-green-500/10 border border-green-500 rounded-lg p-3">
                  <CheckCircle className="h-4 w-4 inline mr-2 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    Workout approved and saved successfully!
                  </span>
                </div>
              )}

              {shareSuccess && (
                <div className="mt-4 bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                  <Check className="h-4 w-4 inline mr-2 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    Workout shared successfully!
                  </span>
                </div>
              )}
              
              {isTrainer() && selectedClient && (
                <div className="mt-4 bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">
                    <Users className="h-4 w-4 inline mr-1" />
                    Workout created for: {mockClients.find(c => c.id === selectedClient)?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="primary" 
                className="flex-1 flex items-center justify-center"
                onClick={handleStartWorkout}
              >
                <Play className="h-4 w-4 mr-2" />
                {isTrainer() && selectedClient ? 'Send to Client' : 'Start Workout'}
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={handleViewSavedWorkouts}
              >
                <Save className="h-4 w-4 mr-2" />
                View Saved Workouts
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={handleShareWorkout}
                disabled={sharing}
              >
                {sharing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-text-primary mr-2"></div>
                ) : shareSuccess ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                {shareSuccess ? 'Shared!' : 'Share'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/dashboard" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-text-primary">AI Workout Generator</h1>
            <p className="text-text-secondary">
              {isTrainer() 
                ? 'Create personalized workouts for your clients powered by AI'
                : 'Create personalized workouts powered by AI'
              }
            </p>
          </div>

          {/* Role indicator */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isTrainer() 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            {isTrainer() ? 'Trainer Mode' : 'Athlete Mode'}
          </div>
        </div>

        {/* Progress Steps */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= stepNumber 
                      ? 'bg-primary text-background' 
                      : 'bg-background text-text-secondary'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step > stepNumber ? 'bg-primary' : 'bg-background'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-text-secondary">Goals & Preferences</span>
              <span className="text-sm text-text-secondary">Equipment & Details</span>
              <span className="text-sm text-text-secondary">Review & Approve</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-card rounded-xl p-8 border border-background">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step === 2 ? (
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={!goals.primary || generating}
                className="flex items-center"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background mr-2"></div>
                    Generating Workout...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Workout
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setStep(step + 1)}
                disabled={!goals.primary}
              >
                Next
              </Button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setGeneratedWorkout(null);
                setSelectedClient('');
                setSaveSuccess(false);
                setShareSuccess(false);
                setGoals({
                  primary: '',
                  secondary: [],
                  timeAvailable: 30,
                  fitnessLevel: 'intermediate',
                  equipment: ['bodyweight'],
                  targetMuscles: [],
                  workoutType: 'mixed'
                });
              }}
              className="flex items-center mx-auto"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Another Workout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutGenerator;