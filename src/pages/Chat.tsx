import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft, Bot, MessageSquare, AlertTriangle, RefreshCw, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTavus } from '../context/TavusContext';
import TavusSetup from '../components/TavusSetup';
import ConversationSetup from '../components/ConversationSetup';
import tavusApi, { ConversationConfig, TRAINER_CONFIGS } from '../services/tavusApi';
import { openaiService, ChatMessage } from '../services/openaiService';

const Chat: React.FC = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const { isAuthenticated, useTestMode } = useTavus();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callFrame, setCallFrame] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [currentConfig, setCurrentConfig] = useState<ConversationConfig | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const videoContainer = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get trainer info if persona ID matches a trainer
  const trainerInfo = personaId ? Object.values(TRAINER_CONFIGS).find(config => 
    config.replicaId === personaId || config.name.toLowerCase() === personaId.toLowerCase()
  ) : null;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: trainerInfo 
          ? `Hi! I'm ${trainerInfo.name}, your ${trainerInfo.specialty.toLowerCase()} coach. I'm here to help you with your fitness goals. What would you like to work on today?`
          : "Hello! I'm your AI fitness coach. I'm here to help you with workouts, form guidance, and reaching your fitness goals. What can I help you with today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [trainerInfo]);

  // Cleanup effect to ensure proper disposal when component unmounts
  useEffect(() => {
    return () => {
      cleanupCallFrame();
    };
  }, []);

  const cleanupCallFrame = () => {
    if (callFrame) {
      try {
        console.log('Cleaning up call frame...');
        callFrame.destroy();
      } catch (err) {
        console.warn('Error destroying call frame:', err);
      }
      setCallFrame(null);
    }
  };

  const startVideoCall = async (config: ConversationConfig) => {
    setIsConnecting(true);
    setError(null);
    setConnectionStatus('connecting');
    setCurrentConfig(config);

    try {
      // Clean up any existing call frame first and wait a moment
      cleanupCallFrame();
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Starting video call with config:', config);
      
      // Create conversation via Tavus API or use test mode
      const conversation = isAuthenticated && !useTestMode 
        ? await tavusApi.createCustomConversation(config)
        : {
            conversationId: 'test_conversation_' + Date.now(),
            conversationUrl: 'https://demo.daily.co/hello',
            status: 'active'
          };

      console.log('Conversation created:', conversation);
      setConversationId(conversation.conversationId);
      setIsVideoCall(true);

      // Wait for the video container to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!videoContainer.current) {
        throw new Error('Video container not found');
      }

      // Join the video call using Daily.js
      const frame = tavusApi.joinConversation(videoContainer.current, conversation.conversationUrl);
      setCallFrame(frame);

      // Set up event listeners
      frame.on('joined-meeting', (event: any) => {
        console.log('Successfully joined meeting:', event);
        setIsConnecting(false);
        setConnectionStatus('connected');
        
        // Add success message
        const successMessage: ChatMessage = {
          role: 'assistant',
          content: `Great! I'm now live and ready to help you with your workout. ${config.customGreeting || "Let's get started!"}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      });

      frame.on('left-meeting', (event: any) => {
        console.log('Left meeting:', event);
        setIsVideoCall(false);
        setConnectionStatus('disconnected');
        setCallFrame(null);
        setConversationId(null);
        setCurrentConfig(null);
      });

      frame.on('error', (error: any) => {
        console.error('Daily.js error:', error);
        let errorMessage = 'Video call failed: ';
        
        if (error.error?.type === 'no-room') {
          errorMessage += 'The meeting room does not exist or is no longer available.';
        } else {
          errorMessage += error.errorMsg || error.message || 'Connection error';
        }
        
        setError(errorMessage);
        setIsConnecting(false);
        setIsVideoCall(false);
        setConnectionStatus('error');
        cleanupCallFrame();
      });

      frame.on('participant-joined', (event: any) => {
        console.log('Participant joined:', event.participant);
        if (event.participant.user_name?.includes('AI') || event.participant.user_name?.includes('Trainer')) {
          const trainerConfig = Object.values(TRAINER_CONFIGS).find(c => c.replicaId === config.replicaId);
          const aiJoinedMessage: ChatMessage = {
            role: 'assistant',
            content: `${trainerConfig?.name || 'Your AI trainer'} has joined the video call! I can now see you and provide personalized coaching.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiJoinedMessage]);
        }
      });

    } catch (err: any) {
      console.error('Failed to start video call:', err);
      
      let errorMessage = 'Failed to start video call. ';
      
      if (err.message === 'Invalid access token') {
        errorMessage += 'Your API key is invalid. Please check your Tavus settings.';
      } else if (err.message?.includes('replica_id')) {
        errorMessage += 'Invalid replica ID. Please try a different trainer.';
      } else if (err.message?.includes('network')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else if (err.message?.includes('Duplicate DailyIframe')) {
        errorMessage += 'Please wait a moment and try again.';
        // Force cleanup and retry
        cleanupCallFrame();
        setTimeout(() => setError(null), 2000);
      } else {
        errorMessage += err.message || 'Please try again or check your connection.';
      }
      
      setError(errorMessage);
      setIsConnecting(false);
      setIsVideoCall(false);
      setConnectionStatus('error');
      cleanupCallFrame();
    }
  };

  const endVideoCall = async () => {
    console.log('Ending video call');
    
    if (callFrame) {
      try {
        callFrame.leave();
      } catch (err) {
        console.warn('Error leaving call:', err);
      }
      cleanupCallFrame();
    }
    
    // End the Tavus conversation if we have one
    if (conversationId && !conversationId.startsWith('test_')) {
      try {
        await tavusApi.endConversation(conversationId);
      } catch (err) {
        console.warn('Failed to end conversation:', err);
      }
    }
    
    setIsVideoCall(false);
    setIsConnecting(false);
    setConnectionStatus('disconnected');
    setConversationId(null);
    setCurrentConfig(null);
    setError(null);

    // Add goodbye message
    const goodbyeMessage: ChatMessage = {
      role: 'assistant',
      content: "Great workout! Feel free to start another video session anytime or ask me questions here in the chat.",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, goodbyeMessage]);
  };

  const toggleVideo = () => {
    if (callFrame) {
      callFrame.setLocalVideo(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (callFrame) {
      callFrame.setLocalAudio(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendingMessage) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSendingMessage(true);

    try {
      // Get trainer personality for context
      const trainerPersonality = trainerInfo 
        ? `${trainerInfo.name}, a ${trainerInfo.specialty.toLowerCase()} specialist`
        : 'a helpful fitness coach';

      // Send to OpenAI service
      const response = await openaiService.sendChatMessage(
        [...messages, userMessage],
        { trainerPersonality }
      );

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or start a video call for live coaching.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connecting': return 'Connecting to video call...';
      case 'connected': return `Connected - ${currentConfig ? Object.values(TRAINER_CONFIGS).find(c => c.replicaId === currentConfig.replicaId)?.name || 'AI trainer' : 'AI trainer'} is live`;
      case 'error': return 'Connection failed';
      default: return 'Ready for video call';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting': return 'text-yellow-400';
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-text-secondary';
    }
  };

  if (!isAuthenticated && !useTestMode) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">AI Trainer Chat</h1>
          <p className="text-text-secondary mb-6">
            Connect to Tavus or use test mode to start conversations with AI trainers
          </p>
          
          <TavusSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <div className="bg-card border-b border-background shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/dashboard" 
              className="mr-4 p-2 rounded-full hover:bg-background transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-text-secondary" />
            </Link>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-text-primary">
                {trainerInfo?.name || currentConfig ? Object.values(TRAINER_CONFIGS).find(c => c.replicaId === currentConfig?.replicaId)?.name : 'AI Fitness Trainer'}
              </h1>
              <p className={`text-xs ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()}
                {useTestMode && ' (Test Mode)'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {useTestMode && (
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                Test Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Video Call Area */}
        <div className="lg:w-2/3 bg-background relative">
          {!isVideoCall ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-900/20 border border-red-500 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-red-200 text-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setError(null)}
                        className="mt-2 text-red-300 border-red-500 hover:bg-red-900/10"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <ConversationSetup
                onStartConversation={startVideoCall}
                loading={isConnecting}
                error={error || undefined}
              />
            </div>
          ) : (
            <div className="h-full relative">
              <div 
                ref={videoContainer} 
                className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
              />
              
              {/* Video Call Controls */}
              {connectionStatus === 'connected' && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-background/80 backdrop-blur-sm rounded-full px-6 py-3">
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoEnabled 
                        ? 'bg-card text-text-primary hover:bg-background' 
                        : 'bg-red-500 text-white'
                    }`}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </button>
                  
                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition-colors ${
                      isAudioEnabled 
                        ? 'bg-card text-text-primary hover:bg-background' 
                        : 'bg-red-500 text-white'
                    }`}
                    title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                  >
                    {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>
                  
                  <button
                    onClick={endVideoCall}
                    className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="End call"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Connection Status Indicator */}
              {connectionStatus === 'connected' && (
                <div className="absolute top-4 left-4 bg-green-500/20 border border-green-500 text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live with AI Trainer {useTestMode && '(Test)'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="lg:w-1/3 bg-card border-l border-background flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-background">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium text-text-primary">AI Chat</h3>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {isVideoCall ? 'Chat during your video session' : 'Ask questions and get fitness advice'}
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%]`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center mb-1">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mr-1">
                          <Bot className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs text-text-secondary">
                          {trainerInfo?.name || 'AI Trainer'}
                        </span>
                      </div>
                    )}
                    
                    <div className={`rounded-2xl px-3 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-background rounded-tr-none' 
                        : 'bg-background text-text-primary rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    {message.timestamp && (
                      <p className={`text-xs text-text-secondary mt-1 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {sendingMessage && (
                <div className="flex justify-start">
                  <div className="bg-background text-text-primary rounded-2xl rounded-tl-none px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-background">
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <textarea 
                  placeholder="Ask about workouts, form, nutrition..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={sendingMessage}
                  className="w-full border border-background rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none bg-background text-text-primary placeholder-text-secondary text-sm disabled:opacity-50"
                  rows={2}
                  style={{ maxHeight: '80px' }}
                />
              </div>
              
              <button 
                className="bg-primary text-background p-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendingMessage}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;