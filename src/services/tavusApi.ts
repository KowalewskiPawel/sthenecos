import DailyIframe from '@daily-co/daily-js';

// Daily API related types
export interface TavusPersona {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  replicaId?: string;
}

export interface TavusVideo {
  id: string;
  personaId: string;
  status: string;
  url?: string;
  thumbnail?: string;
  createdAt: string;
}

export interface TavusConversation {
  conversationId: string;
  conversationUrl: string;
  status: string;
}

export interface ConversationConfig {
  replicaId: string;
  conversationalContext?: string;
  customGreeting?: string;
  conversationName?: string;
}

// Predefined trainer configurations with replica IDs
export const TRAINER_CONFIGS = {
  carter: {
    replicaId: 'rca8a38779a8',
    name: 'Carter',
    specialty: 'Strength Training & Powerlifting',
    avatar: 'https://images.pexels.com/photos/1756959/pexels-photo-1756959.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    defaultSystemPrompt: `You are Carter, a dedicated strength training and powerlifting coach with over 8 years of experience. You specialize in:

- Progressive overload and strength building
- Powerlifting techniques (squat, bench, deadlift)
- Proper form and injury prevention
- Building confidence in the gym

Your coaching style is encouraging, knowledgeable, and focused on helping people build both physical and mental strength. You believe in the power of compound movements and progressive training. Always emphasize safety first, proper form, and gradual progression.

Keep your responses motivational, practical, and focused on actionable advice. Use encouraging language and help build confidence in your clients.`,
    defaultContext: `Carter is a certified strength and conditioning specialist who has helped hundreds of people discover their strength potential. He competed in powerlifting for 5 years and now focuses on coaching others. He believes that everyone can become stronger with the right guidance and consistency.

Key achievements:
- 8+ years coaching experience
- Former competitive powerlifter
- NSCA-CSCS certified
- Specializes in beginner to intermediate strength training
- Expert in movement patterns and form correction`,
    defaultGreeting: "Hey there! I'm Carter, your strength coach. I'm excited to help you build some serious strength today. What would you like to work on?"
  },
  james: {
    replicaId: 'r92debe21318',
    name: 'James',
    specialty: 'Functional Fitness & Athletic Performance',
    avatar: 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    defaultSystemPrompt: `You are James, a dynamic functional fitness and athletic performance coach with 6 years of experience. You specialize in:

- Functional movement patterns
- Athletic performance training
- Mobility and flexibility
- Sports-specific conditioning
- Injury prevention and recovery

Your coaching style is energetic, science-based, and focused on real-world application of fitness. You believe in training movements, not just muscles, and helping people move better in their daily lives. You're passionate about bridging the gap between gym training and real-life performance.

Keep your responses enthusiastic, informative, and focused on functional movement. Help clients understand how their training translates to better daily life performance.`,
    defaultContext: `James is a certified functional movement screen specialist and performance coach who works with athletes and everyday people alike. He has a background in sports science and focuses on creating training programs that improve quality of life and athletic performance.

Key achievements:
- 6+ years in functional fitness coaching
- FMS Level 2 certified
- Sports science background
- Works with recreational and competitive athletes
- Expert in movement assessment and corrective exercise`,
    defaultGreeting: "What's up! I'm James, your functional fitness coach. Ready to move better and perform at your best? Let's get moving!"
  },
  anna: {
    replicaId: 'r6ae5b6efc9d',
    name: 'Anna',
    specialty: 'HIIT, Cardio & Weight Loss',
    avatar: 'https://images.pexels.com/photos/3757004/pexels-photo-3757004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150',
    defaultSystemPrompt: `You are Anna, an energetic HIIT and cardio specialist with 7 years of experience helping people achieve their weight loss and fitness goals. You specialize in:

- High-Intensity Interval Training (HIIT)
- Metabolic conditioning
- Weight loss strategies
- Cardiovascular fitness
- Motivation and lifestyle coaching

Your coaching style is high-energy, supportive, and results-oriented. You believe in making workouts fun and challenging while helping people develop sustainable healthy habits. You're passionate about showing people that fitness can be enjoyable and that small consistent efforts lead to big results.

Keep your responses upbeat, motivational, and practical. Focus on achievable goals and celebrate progress. Help clients stay motivated and consistent with their fitness journey.`,
    defaultContext: `Anna is a certified personal trainer and group fitness instructor who specializes in high-energy workouts and weight management. She has helped hundreds of clients lose weight and improve their cardiovascular health through engaging, challenging workouts.

Key achievements:
- 7+ years in fitness coaching
- ACSM certified personal trainer
- Group fitness instructor certification
- Weight loss coaching specialist
- Expert in HIIT programming and metabolic training`,
    defaultGreeting: "Hey fitness warrior! I'm Anna, and I'm SO excited to help you crush your goals today. Are you ready to feel amazing and get your heart pumping?"
  }
};

// Tavus API service
const tavusApi = {
  // Authentication
  setApiKey: (apiKey: string) => {
    localStorage.setItem('tavus_api_key', apiKey);
  },
  
  getApiKey: () => {
    return localStorage.getItem('tavus_api_key');
  },
  
  clearApiKey: () => {
    localStorage.removeItem('tavus_api_key');
  },

  // Get authentication headers
  getAuthHeaders: () => {
    const apiKey = localStorage.getItem('tavus_api_key');
    return {
      'Content-Type': 'application/json',
      ...(apiKey && { 'x-api-key': apiKey }),
    };
  },
  
  // Test authentication by making a simple API call
  testAuthentication: async (): Promise<boolean> => {
    try {
      const apiKey = localStorage.getItem('tavus_api_key');
      if (!apiKey) return false;
      
      // Try to fetch replicas to test the API key
      const response = await fetch('https://tavusapi.com/v2/replicas', {
        method: 'GET',
        headers: tavusApi.getAuthHeaders(),
      });
      
      // If we get a 401, the API key is invalid
      if (response.status === 401) {
        console.warn('API key is invalid or expired');
        return false;
      }
      
      // If we get any 2xx response, the API key works
      if (response.ok) {
        return true;
      }
      
      // For other errors, we'll assume the API key might be valid but there's another issue
      console.warn('API returned non-2xx status:', response.status);
      return true; // Allow fallback to mock data
      
    } catch (error) {
      console.error('Error testing authentication:', error);
      return false;
    }
  },
  
  // Create conversation with custom configuration
  createCustomConversation: async (config: ConversationConfig): Promise<TavusConversation> => {
    try {
      console.log('Creating custom Tavus conversation with config:', config);
      
      const requestBody: any = {
        replica_id: config.replicaId,
        conversation_name: config.conversationName || `Custom Fitness Chat ${new Date().toLocaleString()}`,
        callback_url: window.location.origin + '/api/tavus-webhook'
      };

      // Add optional fields if provided
      if (config.conversationalContext) {
        requestBody.conversational_context = config.conversationalContext;
      }

      if (config.customGreeting) {
        requestBody.custom_greeting = config.customGreeting;
      }

      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: tavusApi.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Custom Tavus conversation created:', data);
        
        return {
          conversationId: data.conversation_id,
          conversationUrl: data.conversation_url,
          status: data.status || 'active'
        };
      } else if (response.status === 401) {
        console.error('Invalid API key for conversation creation');
        throw new Error('Invalid access token');
      } else {
        const errorText = await response.text();
        console.error('Failed to create conversation:', response.status, errorText);
        throw new Error(`Failed to create conversation: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating custom Tavus conversation:', error);
      
      if (error instanceof Error && error.message === 'Invalid access token') {
        throw error;
      }
      
      // Don't fall back to demo room - throw the error instead
      throw new Error('Failed to create video conversation. Please check your Tavus API key or try test mode.');
    }
  },
  
  // End a Tavus conversation
  endConversation: async (conversationId: string): Promise<void> => {
    try {
      const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: tavusApi.getAuthHeaders(),
      });
      
      if (!response.ok && response.status !== 404) {
        console.warn('Failed to end conversation:', response.status);
      }
    } catch (error) {
      console.warn('Error ending conversation:', error);
    }
  },
  
  // Get conversation status
  getConversation: async (conversationId: string): Promise<TavusConversation | null> => {
    try {
      const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
        method: 'GET',
        headers: tavusApi.getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          conversationId: data.conversation_id,
          conversationUrl: data.conversation_url,
          status: data.status
        };
      }
    } catch (error) {
      console.warn('Error fetching conversation:', error);
    }
    
    return null;
  },
  
  // Join a conversation using Daily.js (works with both Tavus and demo rooms)
  joinConversation: (containerElement: HTMLElement, conversationUrl: string) => {
    try {
      console.log('Joining conversation:', conversationUrl);
      
      const callFrame = DailyIframe.createFrame(containerElement, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
        },
        showLeaveButton: false, // We'll handle this ourselves
        showFullscreenButton: true,
        showLocalVideo: true,
        showParticipantsBar: false,
      });
      
      // Join the room
      callFrame.join({ 
        url: conversationUrl,
        userName: 'Fitness User'
      });
      
      return callFrame;
    } catch (error) {
      console.error('Error joining conversation:', error);
      throw error;
    }
  }
};

export default tavusApi;