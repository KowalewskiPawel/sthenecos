import { supabase } from './supabase';

export interface TrainerClient {
  id: string;
  trainer_id: string;
  client_id: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  client: {
    id: string;
    name: string;
    email: string;
    fitness_level: 'beginner' | 'intermediate' | 'advanced';
    fitness_goals: string[];
    created_at: string;
    avatar_url?: string;
  };
}

export interface ClientWithProgress extends TrainerClient {
  progress_score: number;
  last_workout: string;
  total_workouts: number;
}

export const clientService = {
  // Get trainer's clients with progress data
  getTrainerClients: async (trainerId: string): Promise<ClientWithProgress[]> => {
    try {
      const { data: relationships, error: relationshipError } = await supabase
        .from('trainer_clients')
        .select(`
          *,
          client:client_id (
            id,
            name,
            email,
            fitness_level,
            fitness_goals,
            created_at,
            avatar_url
          )
        `)
        .eq('trainer_id', trainerId);

      if (relationshipError) throw relationshipError;

      // Get progress data for each client
      const clientsWithProgress: ClientWithProgress[] = await Promise.all(
        (relationships || []).map(async (relationship) => {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', relationship.client_id)
            .order('completed_at', { ascending: false });

          if (progressError) {
            console.error('Error fetching progress:', progressError);
          }

          const progress = progressData || [];
          const totalWorkouts = progress.length;
          const lastWorkout = progress[0]?.completed_at || '';
          const averageFormScore = progress.length > 0 
            ? progress.reduce((sum, p) => sum + (p.form_score || 0), 0) / progress.length 
            : 0;

          return {
            ...relationship,
            progress_score: Math.round(averageFormScore),
            last_workout: lastWorkout,
            total_workouts: totalWorkouts
          };
        })
      );

      return clientsWithProgress;
    } catch (error) {
      console.error('Error fetching trainer clients:', error);
      throw error;
    }
  },

  // Search for existing users by email
  searchUserByEmail: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, fitness_level, fitness_goals')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Supabase request failed', {
          url: error.message,
          status: error.code,
          body: error.details
        });
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error searching user:', error);
      throw error;
    }
  },

  // Add client to trainer (only if user exists)
  addClientToTrainer: async (trainerId: string, clientEmail: string) => {
    try {
      console.log('Searching for user with email:', clientEmail);
      
      // First, check if user exists
      const existingUser = await clientService.searchUserByEmail(clientEmail);
      
      if (!existingUser) {
        console.log('User not found with email:', clientEmail);
        throw new Error('User with this email does not exist. They need to register first.');
      }

      console.log('Found user:', existingUser);

      // Check if relationship already exists
      const { data: existingRelationship, error: checkError } = await supabase
        .from('trainer_clients')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('client_id', existingUser.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing relationship:', checkError);
        throw checkError;
      }

      if (existingRelationship) {
        throw new Error('This user is already your client.');
      }

      console.log('Creating trainer-client relationship');

      // Create the trainer-client relationship
      const { data, error } = await supabase
        .from('trainer_clients')
        .insert([{
          trainer_id: trainerId,
          client_id: existingUser.id,
          status: 'active' // Set to active immediately since they're adding existing users
        }])
        .select(`
          *,
          client:client_id (
            id,
            name,
            email,
            fitness_level,
            fitness_goals,
            created_at,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating trainer-client relationship:', error);
        throw error;
      }

      console.log('Successfully created relationship:', data);

      return {
        ...data,
        progress_score: 0,
        last_workout: '',
        total_workouts: 0
      };
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  // Update client status
  updateClientStatus: async (relationshipId: string, status: 'active' | 'inactive' | 'pending') => {
    try {
      const { data, error } = await supabase
        .from('trainer_clients')
        .update({ status })
        .eq('id', relationshipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating client status:', error);
      throw error;
    }
  },

  // Remove client from trainer
  removeClient: async (relationshipId: string) => {
    try {
      const { error } = await supabase
        .from('trainer_clients')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing client:', error);
      throw error;
    }
  },

  // Get client details
  getClientDetails: async (clientId: string) => {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', clientId)
        .single();

      if (userError) throw userError;

      // Get recent workouts
      const { data: workouts, error: workoutError } = await supabase
        .from('user_progress')
        .select(`
          *,
          workout:workout_id (title)
        `)
        .eq('user_id', clientId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (workoutError) {
        console.error('Error fetching client workouts:', workoutError);
      }

      // Get AI generated workouts
      const { data: aiWorkouts, error: aiWorkoutError } = await supabase
        .from('ai_generated_workouts')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (aiWorkoutError) {
        console.error('Error fetching AI workouts:', aiWorkoutError);
      }

      return {
        user,
        recentWorkouts: workouts || [],
        aiWorkouts: aiWorkouts || []
      };
    } catch (error) {
      console.error('Error fetching client details:', error);
      throw error;
    }
  }
};