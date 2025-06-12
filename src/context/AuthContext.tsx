import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  user_role: 'athlete' | 'trainer';
  subscription_tier: 'free' | 'premium' | 'pro';
  subscription_status: 'active' | 'canceled' | 'expired';
  created_at: string;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  fitness_goals: string[];
  specialty?: string;
  avatar_url?: string;
  bio?: string;
  experience_years?: number;
  certifications?: string[];
  hourly_rate?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkSubscription: () => Promise<boolean>;
  isTrainer: () => boolean;
  isAthlete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setError('Failed to initialize authentication');
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('Initial session found:', session.user.id);
          await fetchUserProfile(session.user.id);
        } else if (mounted) {
          console.log('No initial session found');
          setUser(null);
          setError(null);
        }
      } catch (err) {
        console.error('Error in initializeAuth:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Initialize auth state immediately
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !initialized) return;

      console.log('Auth state changed:', event, session?.user?.id);
      
      try {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setError(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        if (mounted) {
          setError('Failed to load user profile');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setError(null);
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        console.log('User profile not found, creating one...');
        await createUserProfile(userId);
        return;
      }

      console.log('User profile found:', data);
      setUser(data);
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError('Failed to load user profile');
      throw err;
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      console.log('Creating user profile for:', userId);
      
      // Get the auth user info
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        throw new Error('No authenticated user found');
      }

      const userData = {
        id: userId,
        email: authUser.user.email!,
        name: authUser.user.user_metadata?.name || authUser.user.email!.split('@')[0],
        user_role: 'athlete' as const, // Default to athlete
        fitness_level: 'beginner' as const,
        fitness_goals: [] as string[],
        subscription_tier: 'free' as const,
        subscription_status: 'active' as const
      };

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      console.log('User profile created:', data);
      setUser(data);
    } catch (err) {
      console.error('Error creating user profile:', err);
      setError('Failed to create user profile');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setError(null);
    
    try {
      console.log('Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            user_role: userData.user_role
          }
        }
      });

      if (error) throw error;

      // If signup is successful and user is confirmed, create profile immediately
      if (data.user && !data.user.email_confirmed_at) {
        // For development, we'll create the profile anyway
        // In production, this would wait for email confirmation
        const profileData = {
          id: data.user.id,
          email: data.user.email!,
          name: userData.name,
          user_role: userData.user_role || 'athlete',
          fitness_level: userData.fitness_level || 'beginner',
          fitness_goals: userData.fitness_goals || [],
          subscription_tier: 'free' as const,
          subscription_status: 'active' as const,
          specialty: userData.specialty,
          bio: userData.bio,
          experience_years: userData.experience_years,
          certifications: userData.certifications
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert([profileData]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw here, let the auth state handler retry
        }
      }
      
      console.log('Sign up successful, user:', data.user?.id);
      
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    
    try {
      console.log('Signing in user:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('Sign in successful');
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Auth state change listener will handle clearing user state
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      setError(null);
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      setUser({ ...user, ...updates });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const checkSubscription = async (): Promise<boolean> => {
    if (!user) return false;
    return user.subscription_tier !== 'free' && user.subscription_status === 'active';
  };

  const isTrainer = (): boolean => {
    return user?.user_role === 'trainer';
  };

  const isAthlete = (): boolean => {
    return user?.user_role === 'athlete';
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    checkSubscription,
    isTrainer,
    isAthlete
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};