import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema types
export interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  trainer_id: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  workouts_per_week: number;
  equipment_needed: string[];
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  program_id: string;
  week_number: number;
  day_number: number;
  title: string;
  description: string;
  exercises: Exercise[];
  estimated_duration: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  equipment: string;
  sets: number;
  reps: string;
  rest_time: number;
  form_tips: string[];
  video_url?: string;
  image_url?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  workout_id: string;
  program_id: string;
  completed_at: string;
  exercises_completed: number;
  total_exercises: number;
  duration_minutes: number;
  calories_burned?: number;
  notes?: string;
  form_score?: number;
}

export interface FormAnalysis {
  id: string;
  user_id: string;
  exercise_id: string;
  video_url: string;
  analysis_result: {
    overall_score: number;
    form_corrections: string[];
    good_points: string[];
    improvement_suggestions: string[];
  };
  created_at: string;
}

export interface GeneratedWorkout {
  id: string;
  user_id: string;
  trainer_id?: string;
  title: string;
  description: string;
  goals: string[];
  fitness_level: string;
  duration_minutes: number;
  equipment_needed: string[];
  workout_structure: any;
  created_at: string;
}

// Database service functions
export const workoutService = {
  // Get all workout programs
  getPrograms: async () => {
    const { data, error } = await supabase
      .from('workout_programs')
      .select(`
        *,
        trainer:trainer_id (name, specialty, avatar_url)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get program workouts
  getProgramWorkouts: async (programId: string) => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('program_id', programId)
      .order('week_number', { ascending: true })
      .order('day_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Record workout completion
  recordWorkoutCompletion: async (progressData: Omit<UserProgress, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('user_progress')
      .insert([progressData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user progress
  getUserProgress: async (userId: string, programId?: string) => {
    let query = supabase
      .from('user_progress')
      .select(`
        *,
        workout:workout_id (title, program_id),
        program:program_id (title)
      `)
      .eq('user_id', userId);

    if (programId) {
      query = query.eq('program_id', programId);
    }

    const { data, error } = await query.order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get generated workouts
  getGeneratedWorkouts: async (userId: string) => {
    const { data, error } = await supabase
      .from('ai_generated_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create workout program
  createProgram: async (programData: Omit<WorkoutProgram, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('workout_programs')
      .insert([programData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const paymentService = {
  // Create checkout session
  createCheckoutSession: async (priceId: string, userId: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId, userId }
    });
    
    if (error) throw error;
    return data;
  },

  // Update subscription
  updateSubscription: async (userId: string, tier: string, status: string) => {
    const { error } = await supabase
      .from('users')
      .update({ 
        subscription_tier: tier,
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  }
};

export const aiService = {
  // Generate AI workout
  generateWorkout: async (goals: any, userId: string, trainerId?: string) => {
    const { data, error } = await supabase.functions.invoke('generate-ai-workout', {
      body: { goals, userId, trainerId }
    });
    
    if (error) throw error;
    return data;
  },

  // Analyze form
  analyzeForm: async (videoUrl: string, exerciseType: string, userId: string) => {
    const { data, error } = await supabase.functions.invoke('analyze-form', {
      body: { videoUrl, exerciseType, userId }
    });
    
    if (error) throw error;
    return data;
  },

  // Upload video
  uploadVideo: async (file: File, userId: string, exerciseType?: string) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('userId', userId);
    if (exerciseType) formData.append('exerciseType', exerciseType);

    const { data, error } = await supabase.functions.invoke('upload-video', {
      body: formData
    });
    
    if (error) throw error;
    return data;
  }
};

export const trainerService = {
  // Get trainer clients
  getClients: async () => {
    const { data, error } = await supabase.functions.invoke('manage-clients', {
      method: 'GET'
    });
    
    if (error) throw error;
    return data;
  },

  // Add client
  addClient: async (clientEmail: string) => {
    const { data, error } = await supabase.functions.invoke('manage-clients', {
      body: { action: 'add', clientEmail }
    });
    
    if (error) throw error;
    return data;
  },

  // Update client status
  updateClientStatus: async (clientId: string, status: string) => {
    const { data, error } = await supabase.functions.invoke('manage-clients', {
      body: { action: 'update', clientId, status }
    });
    
    if (error) throw error;
    return data;
  },

  // Remove client
  removeClient: async (clientId: string) => {
    const { data, error } = await supabase.functions.invoke('manage-clients', {
      body: { action: 'remove', clientId }
    });
    
    if (error) throw error;
    return data;
  }
};