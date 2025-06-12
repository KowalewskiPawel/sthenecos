import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, AlertTriangle, CheckCircle, ExternalLink, Info, Settings, Brain } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTavus } from '../context/TavusContext';

const ApiSettings: React.FC = () => {
  const { isAuthenticated, useTestMode, authenticate, logout, toggleTestMode, loading, error } = useTavus();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load existing API key if available
    const existingKey = localStorage.getItem('tavus_api_key');
    if (existingKey) {
      setApiKey('•'.repeat(20) + existingKey.slice(-8));
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.includes('•')) return;
    
    const success = await authenticate(apiKey);
    if (success) {
      setSaveSuccess(true);
      setApiKey('•'.repeat(20) + apiKey.slice(-8));
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleClearApiKey = () => {
    logout();
    setApiKey('');
    setSaveSuccess(false);
  };

  const handleShowApiKey = () => {
    if (showApiKey) {
      const existingKey = localStorage.getItem('tavus_api_key');
      if (existingKey) {
        setApiKey('•'.repeat(20) + existingKey.slice(-8));
      }
    } else {
      const existingKey = localStorage.getItem('tavus_api_key');
      if (existingKey) {
        setApiKey(existingKey);
      }
    }
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/settings" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-text-primary">API Settings</h1>
            <p className="text-text-secondary">
              Configure your API keys for enhanced features
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Tavus API Configuration */}
          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                <Key className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Tavus API</h2>
                <p className="text-text-secondary text-sm">Enable AI video conversations with trainers</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  isAuthenticated ? 'bg-green-400' : useTestMode ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-text-secondary">
                  Status: {isAuthenticated ? 'Connected' : useTestMode ? 'Test Mode' : 'Not Connected'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  API Key
                </label>
                <div className="flex space-x-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Tavus API key..."
                    className="flex-1 px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowApiKey}
                    disabled={!apiKey}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveApiKey}
                    disabled={!apiKey || apiKey.includes('•') || loading}
                  >
                    {loading ? 'Verifying...' : 'Save'}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {saveSuccess && (
                <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-green-400 text-sm">API key saved and verified successfully!</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-background">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTestMode}
                  >
                    {useTestMode ? 'Disable Test Mode' : 'Enable Test Mode'}
                  </Button>
                  
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearApiKey}
                    >
                      Clear API Key
                    </Button>
                  )}
                </div>

                <a
                  href="https://tavusapi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm flex items-center"
                >
                  Get API Key <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>

              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-200 text-sm">
                    <p className="font-medium mb-1">About Tavus API:</p>
                    <p>Tavus enables realistic AI video conversations with personalized trainer avatars. With your API key, you can have live video calls where AI trainers can see you and provide real-time feedback on your form and technique.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OpenAI API Information */}
          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mr-3">
                <Brain className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">OpenAI API</h2>
                <p className="text-text-secondary text-sm">Powers AI workout generation and chat features</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-start">
                  <Settings className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-yellow-200 text-sm">
                    <p className="font-medium mb-2">Backend Configuration Required</p>
                    <p className="mb-3">
                      The OpenAI API key is configured on the backend for security reasons. This enables AI-powered workout generation and enhanced chat capabilities.
                    </p>
                    <div className="space-y-2">
                      <p><strong>To enable OpenAI features:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>Go to your Supabase project dashboard</li>
                        <li>Navigate to Edge Functions</li>
                        <li>Select the "generate-ai-workout" function</li>
                        <li>Add environment variable: <code className="bg-yellow-900/30 px-1 rounded">OPENAI_API_KEY</code></li>
                        <li>Set the value to your OpenAI API key</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-text-secondary">
                  Current status: Backend configuration required
                </div>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm flex items-center"
                >
                  Get OpenAI API Key <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Stripe Configuration Information */}
          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                <Key className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Stripe API</h2>
                <p className="text-text-secondary text-sm">Handles subscription payments and billing</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
                <div className="flex items-start">
                  <Settings className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-purple-200 text-sm">
                    <p className="font-medium mb-2">Backend Configuration Required</p>
                    <p className="mb-3">
                      Stripe API keys are configured on the backend for secure payment processing.
                    </p>
                    <div className="space-y-2">
                      <p><strong>To enable Stripe payments:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>Go to your Supabase project dashboard</li>
                        <li>Navigate to Edge Functions</li>
                        <li>Select the "create-checkout-session" function</li>
                        <li>Add environment variable: <code className="bg-purple-900/30 px-1 rounded">STRIPE_SECRET_KEY</code></li>
                        <li>Set the value to your Stripe secret key</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-text-secondary">
                  Current status: Backend configuration required
                </div>
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm flex items-center"
                >
                  Get Stripe API Keys <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* General Information */}
          <div className="bg-background rounded-xl p-6 border border-background">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Important Notes</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p>All API keys are stored securely and never shared with third parties</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p>Frontend API keys (like Tavus) are stored locally in your browser</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p>Backend API keys (OpenAI, Stripe) are configured in your Supabase project</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p>Test mode allows you to try features without API keys</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;