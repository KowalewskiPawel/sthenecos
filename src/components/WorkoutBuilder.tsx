import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { 
  Plus, 
  Clock, 
  Users, 
  Target, 
  Flame,
  Heart,
  Zap,
  Wind,
  Trash2,
  Copy,
  Save,
  Play,
  Edit3,
  GripVertical
} from 'lucide-react';

interface WorkoutBlock {
  id: string;
  title: string;
  description: string;
  category: 'warmup' | 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'cooldown';
  duration: number; // minutes
  exercises: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  targetMuscles: string[];
}

interface CustomWorkout {
  title: string;
  description: string;
  blocks: WorkoutBlock[];
  totalDuration: number;
  targetLevel: 'beginner' | 'intermediate' | 'advanced';
}

const WorkoutBuilder: React.FC = () => {
  const { user, isTrainer } = useAuth();
  const [selectedBlocks, setSelectedBlocks] = useState<WorkoutBlock[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('warmup');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Pre-made workout blocks library
  const workoutBlocks: WorkoutBlock[] = [
    // Warm-up blocks
    {
      id: 'warmup-basic',
      title: 'Basic Dynamic Warm-up',
      description: 'General activation and mobility prep',
      category: 'warmup',
      duration: 5,
      exercises: ['Arm Circles', 'Leg Swings', 'Torso Twists', 'Light Jogging'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['full body']
    },
    {
      id: 'warmup-athletic',
      title: 'Athletic Movement Prep',
      description: 'Sport-specific activation patterns',
      category: 'warmup',
      duration: 8,
      exercises: ['High Knees', 'Butt Kicks', 'Leg Swings', 'Arm Circles', 'Dynamic Lunges', 'Inchworms'],
      difficulty: 'intermediate',
      equipment: ['none'],
      targetMuscles: ['full body']
    },
    {
      id: 'warmup-strength',
      title: 'Strength-Focused Activation',
      description: 'Prime movement patterns for lifting',
      category: 'warmup',
      duration: 10,
      exercises: ['Band Pull-Aparts', 'Bodyweight Squats', 'Push-up to T', 'Cat-Cow', 'Glute Bridges'],
      difficulty: 'intermediate',
      equipment: ['resistance band'],
      targetMuscles: ['shoulders', 'core', 'glutes']
    },

    // Strength blocks
    {
      id: 'strength-upper-basic',
      title: 'Upper Body Foundation',
      description: 'Essential upper body strength movements',
      category: 'strength',
      duration: 15,
      exercises: ['Push-ups', 'Pike Push-ups', 'Tricep Dips', 'Plank'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['chest', 'shoulders', 'triceps', 'core']
    },
    {
      id: 'strength-lower-basic',
      title: 'Lower Body Foundation',
      description: 'Core lower body strength patterns',
      category: 'strength',
      duration: 15,
      exercises: ['Squats', 'Lunges', 'Single-leg Glute Bridges', 'Wall Sits'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['quadriceps', 'glutes', 'hamstrings']
    },
    {
      id: 'strength-compound',
      title: 'Compound Power',
      description: 'Multi-joint strength movements',
      category: 'strength',
      duration: 20,
      exercises: ['Goblet Squats', 'Push-up to T', 'Single-arm Rows', 'Turkish Get-ups'],
      difficulty: 'intermediate',
      equipment: ['dumbbells'],
      targetMuscles: ['full body']
    },
    {
      id: 'strength-advanced',
      title: 'Advanced Strength Circuit',
      description: 'Challenging strength progressions',
      category: 'strength',
      duration: 25,
      exercises: ['Pistol Squats', 'One-arm Push-ups', 'Handstand Push-ups', 'L-sits'],
      difficulty: 'advanced',
      equipment: ['none'],
      targetMuscles: ['full body']
    },

    // Cardio blocks
    {
      id: 'cardio-steady',
      title: 'Steady State Cardio',
      description: 'Moderate intensity endurance work',
      category: 'cardio',
      duration: 15,
      exercises: ['Marching in Place', 'Step Touches', 'Knee Lifts', 'Side Steps'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['cardiovascular']
    },
    {
      id: 'cardio-dance',
      title: 'Dance Cardio Flow',
      description: 'Fun, rhythmic cardio movements',
      category: 'cardio',
      duration: 12,
      exercises: ['Grapevines', 'Cha-cha Steps', 'Arm Swings', 'Hip Circles'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['full body', 'cardiovascular']
    },
    {
      id: 'cardio-boxing',
      title: 'Boxing Cardio',
      description: 'High-energy boxing-inspired cardio',
      category: 'cardio',
      duration: 18,
      exercises: ['Jabs', 'Crosses', 'Hooks', 'Uppercuts', 'Bob and Weave'],
      difficulty: 'intermediate',
      equipment: ['none'],
      targetMuscles: ['arms', 'core', 'cardiovascular']
    },

    // HIIT blocks
    {
      id: 'hiit-basic',
      title: 'Beginner HIIT Circuit',
      description: '30sec work, 30sec rest intervals',
      category: 'hiit',
      duration: 12,
      exercises: ['Modified Burpees', 'Jump Squats', 'Mountain Climbers', 'Plank Jacks'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['full body']
    },
    {
      id: 'hiit-tabata',
      title: 'Tabata Blast',
      description: '20sec work, 10sec rest x 8 rounds',
      category: 'hiit',
      duration: 8,
      exercises: ['Burpees', 'Jump Squats', 'Push-ups', 'High Knees'],
      difficulty: 'intermediate',
      equipment: ['none'],
      targetMuscles: ['full body']
    },
    {
      id: 'hiit-advanced',
      title: 'Advanced HIIT Complex',
      description: 'High-intensity compound movements',
      category: 'hiit',
      duration: 15,
      exercises: ['Burpee Broad Jumps', 'Plyometric Push-ups', 'Jump Lunges', 'Tuck Jumps'],
      difficulty: 'advanced',
      equipment: ['none'],
      targetMuscles: ['full body']
    },

    // Flexibility blocks
    {
      id: 'flex-basic',
      title: 'Basic Stretching',
      description: 'Essential flexibility routine',
      category: 'flexibility',
      duration: 8,
      exercises: ['Hamstring Stretch', 'Quad Stretch', 'Calf Stretch', 'Shoulder Stretch'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['legs', 'shoulders']
    },
    {
      id: 'flex-yoga',
      title: 'Yoga Flow',
      description: 'Dynamic yoga sequence',
      category: 'flexibility',
      duration: 15,
      exercises: ['Sun Salutation', 'Warrior Poses', 'Triangle Pose', 'Child\'s Pose'],
      difficulty: 'intermediate',
      equipment: ['yoga mat'],
      targetMuscles: ['full body']
    },
    {
      id: 'flex-deep',
      title: 'Deep Stretch Session',
      description: 'Intensive flexibility work',
      category: 'flexibility',
      duration: 20,
      exercises: ['PNF Stretching', 'Hip Flexor Stretch', 'Thoracic Spine Mobility', 'Pigeon Pose'],
      difficulty: 'advanced',
      equipment: ['yoga mat', 'strap'],
      targetMuscles: ['hips', 'spine', 'shoulders']
    },

    // Cool-down blocks
    {
      id: 'cooldown-gentle',
      title: 'Gentle Cool-down',
      description: 'Light stretching and relaxation',
      category: 'cooldown',
      duration: 5,
      exercises: ['Standing Forward Fold', 'Seated Spinal Twist', 'Deep Breathing'],
      difficulty: 'beginner',
      equipment: ['none'],
      targetMuscles: ['full body']
    },
    {
      id: 'cooldown-recovery',
      title: 'Active Recovery',
      description: 'Promote circulation and flexibility',
      category: 'cooldown',
      duration: 10,
      exercises: ['Cat-Cow Stretch', 'Figure-4 Stretch', 'Neck Rolls', 'Progressive Relaxation'],
      difficulty: 'intermediate',
      equipment: ['yoga mat'],
      targetMuscles: ['spine', 'hips', 'shoulders']
    }
  ];

  // Quick workout templates
  const quickTemplates = [
    {
      name: '30-Min Full Body',
      blocks: ['warmup-basic', 'strength-upper-basic', 'strength-lower-basic', 'cooldown-gentle'],
      description: 'Complete full-body workout for beginners'
    },
    {
      name: '20-Min HIIT',
      blocks: ['warmup-athletic', 'hiit-tabata', 'hiit-basic', 'cooldown-gentle'],
      description: 'High-intensity interval training session'
    },
    {
      name: '45-Min Strength',
      blocks: ['warmup-strength', 'strength-compound', 'strength-upper-basic', 'strength-lower-basic', 'cooldown-recovery'],
      description: 'Comprehensive strength training workout'
    },
    {
      name: '25-Min Cardio Flow',
      blocks: ['warmup-basic', 'cardio-dance', 'cardio-boxing', 'cooldown-gentle'],
      description: 'Fun cardio workout with variety'
    }
  ];

  const categories = [
    { id: 'warmup', name: 'Warm-up', icon: <Wind className="h-5 w-5" />, color: 'text-blue-400' },
    { id: 'strength', name: 'Strength', icon: <Zap className="h-5 w-5" />, color: 'text-red-400' },
    { id: 'cardio', name: 'Cardio', icon: <Heart className="h-5 w-5" />, color: 'text-pink-400' },
    { id: 'hiit', name: 'HIIT', icon: <Flame className="h-5 w-5" />, color: 'text-orange-400' },
    { id: 'flexibility', name: 'Flexibility', icon: <Target className="h-5 w-5" />, color: 'text-green-400' },
    { id: 'cooldown', name: 'Cool-down', icon: <Wind className="h-5 w-5" />, color: 'text-purple-400' }
  ];

  // Mock clients for trainers
  const mockClients = [
    { id: 'self', name: 'Personal Workout', level: 'intermediate' },
    { id: '1', name: 'Sarah Johnson', level: 'beginner' },
    { id: '2', name: 'Mike Chen', level: 'intermediate' },
    { id: '3', name: 'Emma Rodriguez', level: 'advanced' }
  ];

  const addBlock = (block: WorkoutBlock) => {
    setSelectedBlocks([...selectedBlocks, { ...block, id: `${block.id}-${Date.now()}` }]);
  };

  const removeBlock = (index: number) => {
    setSelectedBlocks(selectedBlocks.filter((_, i) => i !== index));
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...selectedBlocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    setSelectedBlocks(newBlocks);
  };

  const applyTemplate = (template: any) => {
    const templateBlocks = template.blocks
      .map((blockId: string) => workoutBlocks.find(b => b.id === blockId))
      .filter(Boolean)
      .map((block: WorkoutBlock, index: number) => ({ ...block, id: `${block.id}-${Date.now()}-${index}` }));
    
    setSelectedBlocks(templateBlocks);
    setWorkoutTitle(template.name);
    setWorkoutDescription(template.description);
  };

  const calculateTotalDuration = () => {
    return selectedBlocks.reduce((total, block) => total + block.duration, 0);
  };

  const getFilteredBlocks = () => {
    return workoutBlocks.filter(block => block.category === activeCategory);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-text-secondary bg-background';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Workout Builder</h1>
        <p className="text-text-secondary">
          Build custom workouts using pre-made exercise blocks. Mix and match to create the perfect routine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workout Blocks Library */}
        <div className="lg:col-span-2">
          {/* Quick Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickTemplates.map((template, index) => (
                <div
                  key={index}
                  className="bg-card p-4 rounded-lg border border-background hover:border-primary transition-colors cursor-pointer"
                  onClick={() => applyTemplate(template)}
                >
                  <h3 className="font-semibold text-text-primary mb-2">{template.name}</h3>
                  <p className="text-text-secondary text-sm mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {template.blocks.length} blocks
                    </span>
                    <Button size="sm" variant="outline">
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    activeCategory === category.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-background text-text-secondary hover:border-primary'
                  }`}
                >
                  <span className={category.color}>{category.icon}</span>
                  <span className="ml-2 font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredBlocks().map((block) => (
              <div
                key={block.id}
                className="bg-card p-6 rounded-lg border border-background hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{block.title}</h3>
                    <p className="text-text-secondary text-sm">{block.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(block.difficulty)}`}>
                    {block.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-text-secondary">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{block.duration} min</span>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Target className="h-4 w-4 mr-1" />
                    <span>{block.exercises.length} exercises</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-text-secondary mb-1">Exercises:</p>
                  <p className="text-sm text-text-primary">{block.exercises.slice(0, 3).join(', ')}{block.exercises.length > 3 ? '...' : ''}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center"
                  onClick={() => addBlock(block)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Block
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Builder Panel */}
        <div className="bg-card rounded-xl p-6 border border-background">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Your Workout</h2>

          {/* Client Selection for Trainers */}
          {isTrainer() && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Create for:
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
              >
                {mockClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Workout Details */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Workout title..."
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary mb-3"
            />
            <textarea
              placeholder="Workout description..."
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
            />
          </div>

          {/* Workout Summary */}
          <div className="mb-6 p-4 bg-background rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary">Total Duration</p>
                <p className="text-text-primary font-semibold">{calculateTotalDuration()} min</p>
              </div>
              <div>
                <p className="text-text-secondary">Blocks</p>
                <p className="text-text-primary font-semibold">{selectedBlocks.length}</p>
              </div>
            </div>
          </div>

          {/* Selected Blocks */}
          <div className="space-y-3 mb-6">
            {selectedBlocks.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">No blocks selected yet</p>
                <p className="text-text-secondary text-sm">Add blocks from the library to build your workout</p>
              </div>
            ) : (
              selectedBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="flex items-center p-3 bg-background rounded-lg border border-background"
                >
                  <div className="cursor-move mr-3">
                    <GripVertical className="h-4 w-4 text-text-secondary" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-text-primary text-sm">{block.title}</h4>
                      <span className="text-xs text-text-secondary">{block.duration} min</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{block.category}</p>
                  </div>

                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => addBlock(block)}
                      className="p-1 rounded text-text-secondary hover:text-primary"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeBlock(index)}
                      className="p-1 rounded text-text-secondary hover:text-red-400"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full flex items-center justify-center"
              disabled={selectedBlocks.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Workout
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={selectedBlocks.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Preview Workout
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => {
                setSelectedBlocks([]);
                setWorkoutTitle('');
                setWorkoutDescription('');
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutBuilder;