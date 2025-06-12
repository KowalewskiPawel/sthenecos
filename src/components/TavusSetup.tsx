import React, { useState } from 'react';
import { useTavus } from '../context/TavusContext';
import Button from './ui/Button';
import { Key, Lock, AlertTriangle, CheckCircle, Video, Wifi, WifiOff } from 'lucide-react';

const TavusSetup: React.FC = () => {
  const { isAuthenticated, useDefaultPersona, toggleDefaultPersona, authenticate, logout, loading, error } = useTavus();
  const [apiKey, setApiKey] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    const success = await authenticate(apiKey);
    if (success) {
      setShowSuccess(true);
      setApiKey(''); // Clear the input
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
    // If not successful, the error will be shown via the error state
  };

  const handleLogout = () => {
    logout();
    setApiKey('');
    setShowSuccess(false);
  };

  if (isAuthenticated) {
    return (
      <div className="bg-card rounded-xl p-4 border border-primary mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="h-6 w-6 text-primary mr-3" />
            <div>
              <h2 className="font-semibold text-text-primary">Connected to Tavus</h2>
              <p className="text-sm text-text-secondary">
                {useDefaultPersona ? 'Using test mode' : 'Real API mode active'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={useDefaultPersona ? "primary" : "outline"}
              size="sm"
              onClick={toggleDefaultPersona}
            >
              {useDefaultPersona ? "Test Mode" : "Switch to Test"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <WifiOff className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-background mb-6">
      <h2 className="text-xl font-semibold text-text-primary mb-2">Connect to Tavus</h2>
      <p className="text-text-secondary mb-4">
        Enter your Tavus API key to enable AI video generation for your trainer personas.
      </p>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 text-sm">{error}</p>
              {error.includes('Invalid') && (
                <p className="text-red-300 text-xs mt-1">
                  Make sure you're using a valid Tavus API key from your dashboard.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-green-200 text-sm">Successfully connected to Tavus!</p>
          </div>
        </div>
      )}

      <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <Video className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-text-primary font-medium mb-1">Use Default Test Mode</p>
            <p className="text-text-secondary text-sm mb-3">
              Don't have a Tavus account? You can use the default test persona (ID: p77560b8b4c1) to explore the app.
            </p>
            <Button
              variant={useDefaultPersona ? "primary" : "outline"}
              onClick={toggleDefaultPersona}
              size="sm"
            >
              {useDefaultPersona ? "✓ Using Test Mode" : "Use Test Mode"}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-text-secondary mb-1">
            Tavus API Key
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-primary"
              placeholder="Enter your Tavus API key"
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            You can find your API key in your Tavus dashboard under Settings &gt; API.
          </p>
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full flex items-center justify-center"
          disabled={loading || !apiKey.trim()}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Connect to Tavus
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 text-xs text-text-secondary">
        <p>
          Don't have a Tavus account?{' '}
          <a
            href="https://tavus.io/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default TavusSetup;