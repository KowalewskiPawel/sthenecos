import React, { useState } from 'react';
import { useTavus } from '../context/TavusContext';
import { TRAINER_CONFIGS, ConversationConfig } from '../services/tavusApi';
import Button from './ui/Button';
import { 
  MessageSquare, 
  User, 
  Settings, 
  Play, 
  Loader, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Target,
  Video as VideoIcon
} from 'lucide-react';

interface ConversationSetupProps {
  onStartConversation: (config: ConversationConfig) => void;
  loading?: boolean;
  error?: string;
}

const ConversationSetup: React.FC<ConversationSetupProps> = ({ 
  onStartConversation, 
  loading = false, 
  error 
}) => {
  const { useTestMode } = useTavus();
  const [selectedTrainer, setSelectedTrainer] = useState<string>('carter');
  const [customContext, setCustomContext] = useState<string>('');
  const [customGreeting, setCustomGreeting] = useState<string>('');
  const [useCustomConfig, setUseCustomConfig] = useState<boolean>(false);

  const selectedConfig = TRAINER_CONFIGS[selectedTrainer as keyof typeof TRAINER_CONFIGS];

  const handleStartConversation = () => {
    const config: ConversationConfig = {
      replicaId: selectedConfig.replicaId,
      conversationName: `Chat with ${selectedConfig.name}`,
      conversationalContext: useCustomConfig && customContext.trim() 
        ? customContext.trim() 
        : selectedConfig.defaultContext,
      customGreeting: useCustomConfig && customGreeting.trim() 
        ? customGreeting.trim() 
        : selectedConfig.defaultGreeting
    };

    onStartConversation(config);
  };

  const getTrainerIcon = (trainerKey: string) => {
    switch (trainerKey) {
      case 'carter': return <Zap className="h-5 w-5 text-primary" />;
      case 'james': return <Target className="h-5 w-5 text-primary" />;
      case 'anna': return <VideoIcon className="h-5 w-5 text-primary" />;
      default: return <User className="h-5 w-5 text-primary" />;
    }
  };

  const resetToDefaults = () => {
    setCustomContext(selectedConfig.defaultContext);
    setCustomGreeting(selectedConfig.defaultGreeting);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl p-6 border border-background">
        <div className="flex items-center mb-6">
          <MessageSquare className="h-6 w-6 text-primary mr-3" />
          <h2 className="text-xl font-semibold text-text-primary">Start Custom Conversation</h2>
        </div>

        {useTestMode && (
          <div className="bg-primary/10 border border-primary rounded-lg p-3 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-text-primary font-medium text-sm">Test Mode Active</p>
                <p className="text-text-secondary text-xs mt-1">
                  Conversations will use Daily.js demo room for testing
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Trainer Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Select AI Trainer
          </label>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(TRAINER_CONFIGS).map(([key, config]) => (
              <div
                key={key}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTrainer === key
                    ? 'border-primary bg-primary/10'
                    : 'border-background hover:border-primary/50'
                }`}
                onClick={() => setSelectedTrainer(key)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="trainer"
                    value={key}
                    checked={selectedTrainer === key}
                    onChange={() => setSelectedTrainer(key)}
                    className="mr-3"
                  />
                  {getTrainerIcon(key)}
                  <div className="ml-3 flex-grow">
                    <h3 className="font-medium text-text-primary">{config.name}</h3>
                    <p className="text-sm text-text-secondary">{config.specialty}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Replica ID: {config.replicaId}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Configuration Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useCustomConfig}
                onChange={(e) => setUseCustomConfig(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-text-secondary">
                Customize Context & Greeting
              </span>
            </label>
            {useCustomConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="flex items-center"
              >
                <Settings className="h-3 w-3 mr-1" />
                Load Defaults
              </Button>
            )}
          </div>
        </div>

        {useCustomConfig && (
          <div className="space-y-4 mb-6">
            {/* Custom Context */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Conversational Context
              </label>
              <textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder={selectedConfig.defaultContext}
                className="w-full h-32 px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-sm"
              />
              <p className="text-xs text-text-secondary mt-1">
                This context helps the AI understand your specific needs and goals
              </p>
            </div>

            {/* Custom Greeting */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Custom Greeting
              </label>
              <textarea
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                placeholder={selectedConfig.defaultGreeting}
                className="w-full h-20 px-3 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary text-sm"
              />
              <p className="text-xs text-text-secondary mt-1">
                The first message the AI trainer will say when you join the conversation
              </p>
            </div>
          </div>
        )}

        {/* Default Configuration Preview */}
        {!useCustomConfig && (
          <div className="bg-background rounded-lg p-4 mb-6">
            <h3 className="font-medium text-text-primary mb-3">
              Default Configuration for {selectedConfig.name}
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-text-secondary mb-1">Default Greeting:</p>
                <p className="text-sm text-text-primary italic">"{selectedConfig.defaultGreeting}"</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-text-secondary mb-1">Expertise Context:</p>
                <p className="text-sm text-text-primary line-clamp-3">
                  {selectedConfig.defaultContext.split('\n')[0]}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        <Button
          variant="primary"
          onClick={handleStartConversation}
          disabled={loading}
          className="w-full flex items-center justify-center"
          size="lg"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Starting Conversation...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Start Video Conversation
            </>
          )}
        </Button>

        <p className="text-xs text-text-secondary mt-3 text-center">
          {useTestMode 
            ? 'Test mode: Will use Daily.js demo room for testing' 
            : 'Real conversation will be created with Tavus API'
          }
        </p>
      </div>
    </div>
  );
};

export default ConversationSetup;