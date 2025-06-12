import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tavusApi, { ConversationConfig, TavusConversation, TRAINER_CONFIGS } from '../services/tavusApi';

interface TavusContextType {
  isAuthenticated: boolean;
  useTestMode: boolean;
  loading: boolean;
  error: string | null;
  authenticate: (apiKey: string) => Promise<boolean>;
  toggleTestMode: () => void;
  logout: () => void;
  createCustomConversation: (config: ConversationConfig) => Promise<TavusConversation>;
  getTrainerConfig: (replicaId: string) => any;
}

const TavusContext = createContext<TavusContextType | undefined>(undefined);

export const TavusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [useTestMode, setUseTestMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we have an API key on mount
  useEffect(() => {
    const apiKey = tavusApi.getApiKey();
    if (apiKey) {
      // Try to authenticate on app load
      authenticate(apiKey).then(success => {
        if (success) {
          setUseTestMode(false);
        } else {
          // If authentication fails, clear the stored key and use test mode
          tavusApi.clearApiKey();
          setUseTestMode(true);
        }
      });
    }
  }, []);

  const toggleTestMode = () => {
    setUseTestMode(!useTestMode);
    setError(null); // Clear any previous errors
  };

  const authenticate = async (apiKey: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Store the API key
      tavusApi.setApiKey(apiKey);
      
      // Test the API key
      const isValid = await tavusApi.testAuthentication();
      
      if (!isValid) {
        throw new Error('Invalid API key or authentication failed');
      }
      
      setIsAuthenticated(true);
      setUseTestMode(false);
      
      return true;
    } catch (err) {
      console.error('Authentication failed:', err);
      
      let errorMessage = 'Authentication failed. Please check your API key.';
      if (err instanceof Error) {
        if (err.message === 'Invalid access token') {
          errorMessage = 'Invalid API key. Please check your Tavus API key and try again.';
        } else if (err.message.includes('authentication failed')) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      tavusApi.clearApiKey();
      setIsAuthenticated(false);
      setUseTestMode(true);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tavusApi.clearApiKey();
    setIsAuthenticated(false);
    setError(null);
    setUseTestMode(true);
  };

  const createCustomConversation = async (config: ConversationConfig): Promise<TavusConversation> => {
    if (useTestMode) {
      // Return a mock conversation with a working Daily.co demo room for test mode
      return {
        conversationId: 'test_conversation_' + Date.now(),
        conversationUrl: 'https://demo.daily.co/hello',
        status: 'active'
      };
    }
    
    try {
      setLoading(true);
      setError(null);
      const conversation = await tavusApi.createCustomConversation(config);
      return conversation;
    } catch (err) {
      console.error('Failed to create custom conversation:', err);
      
      if (err instanceof Error && err.message === 'Invalid access token') {
        setError('Authentication expired. Please re-enter your API key.');
        setIsAuthenticated(false);
        setUseTestMode(true);
      } else {
        setError('Failed to create conversation. Please check your API key or try test mode.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrainerConfig = (replicaId: string) => {
    return Object.values(TRAINER_CONFIGS).find(config => config.replicaId === replicaId);
  };

  const value = {
    isAuthenticated,
    useTestMode,
    loading,
    error,
    authenticate,
    toggleTestMode,
    logout,
    createCustomConversation,
    getTrainerConfig
  };

  return <TavusContext.Provider value={value}>{children}</TavusContext.Provider>;
};

export const useTavus = () => {
  const context = useContext(TavusContext);
  if (context === undefined) {
    throw new Error('useTavus must be used within a TavusProvider');
  }
  return context;
};