import { supabase } from './supabase';

export interface WorkoutGoals {
  primary: string;
  secondary?: string[];
  timeAvailable: number; // minutes
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  targetMuscles?: string[];
  workoutType: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed';
}

export interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  duration?: number; // for time-based exercises
  restTime: number; // seconds
  instructions: string;
  muscleGroups: string[];
  equipment?: string;
  modifications?: {
    easier: string;
    harder: string;
  };
}

export interface GeneratedWorkout {
  id?: string;
  title: string;
  description: string;
  totalDuration: number;
  warmup: GeneratedExercise[];
  mainWorkout: GeneratedExercise[];
  cooldown: GeneratedExercise[];
  notes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedCalories: number;
}

// AI workout generation using Supabase Edge Function
export const generateAIWorkout = async (goals: WorkoutGoals, userId: string, trainerId?: string): Promise<GeneratedWorkout> => {
  try {
    console.log('Generating AI workout for user:', userId, 'with goals:', goals);
    
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-ai-workout', {
      body: { goals, userId, trainerId },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Error calling generate-ai-workout function:', error);
      // Provide more detailed error information
      throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
    }

    if (!data) {
      throw new Error('No data received from edge function');
    }

    console.log('Generated workout:', data);
    return data;
  } catch (error) {
    console.error('Error generating AI workout:', error);
    
    // Preserve the original error message instead of generic one
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to generate workout: ' + String(error));
  }
};

// Get user's generated workouts
export const getUserGeneratedWorkouts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching generated workouts:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserGeneratedWorkouts:', error);
    throw error;
  }
};

// Get trainer's generated workouts for clients
export const getTrainerGeneratedWorkouts = async (trainerId: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_workouts')
      .select(`
        *,
        user:user_id (name, email)
      `)
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trainer generated workouts:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getTrainerGeneratedWorkouts:', error);
    throw error;
  }
};