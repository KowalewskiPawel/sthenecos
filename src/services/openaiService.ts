import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatConfig {
  trainerPersonality?: string;
  userContext?: string;
  maxTokens?: number;
  temperature?: number;
}

class OpenAIService {
  private apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-chat`;

  async sendChatMessage(
    messages: ChatMessage[],
    config: ChatConfig = {}
  ): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages,
          config: {
            maxTokens: config.maxTokens || 150,
            temperature: config.temperature || 0.7,
            trainerPersonality: config.trainerPersonality || 'helpful fitness coach',
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.message || 'Sorry, I encountered an error. Please try again.';
    } catch (error) {
      console.error('OpenAI chat error:', error);
      
      // Fallback to predefined responses if OpenAI is not configured
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return "I'd be happy to help you with your workout! For the best experience, make sure OpenAI is configured in your backend. In the meantime, you can generate AI workouts using our workout generator or start a video call for live coaching.";
    }
    
    if (lowerMessage.includes('form') || lowerMessage.includes('technique')) {
      return "Form is crucial for effective and safe training! I recommend starting a video call where I can watch your technique in real-time and provide immediate feedback. You can also use our form analysis feature.";
    }
    
    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      return "Nutrition plays a huge role in fitness success! While I can provide general guidance, for detailed meal planning, consider our premium features or consult with a registered dietitian.";
    }
    
    if (lowerMessage.includes('pain') || lowerMessage.includes('injury')) {
      return "If you're experiencing pain, please consult with a healthcare professional or physical therapist. I can help with general exercise modifications, but safety is always the top priority.";
    }
    
    return "Thanks for your message! For the most personalized guidance, I recommend starting a video call where we can work together in real-time. You can also use our AI workout generator for custom training plans.";
  }

  async generateWorkoutDescription(workoutData: any): Promise<string> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a fitness expert. Create a motivating and informative description for a workout based on the provided data. Keep it concise but inspiring.'
        },
        {
          role: 'user',
          content: `Create a description for this workout: ${JSON.stringify(workoutData)}`
        }
      ];

      return await this.sendChatMessage(messages, { maxTokens: 100, temperature: 0.8 });
    } catch (error) {
      console.error('Error generating workout description:', error);
      return 'A personalized workout designed to help you reach your fitness goals.';
    }
  }
}

export const openaiService = new OpenAIService();