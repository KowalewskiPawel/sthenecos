import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import WorkoutLibrary from './components/WorkoutLibrary';
import ProgressTracker from './components/ProgressTracker';
import SubscriptionPlans from './components/SubscriptionPlans';
import FormAnalysisAI from './components/FormAnalysisAI';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import WorkoutGenerator from './pages/WorkoutGenerator';
import WorkoutBuilder from './components/WorkoutBuilder';
import Settings from './pages/Settings';
import ApiSettings from './pages/ApiSettings';
import SavedWorkouts from './pages/SavedWorkouts';
import WorkoutSession from './pages/WorkoutSession';
import Clients from './pages/Clients';

// Context
import { AuthProvider } from './context/AuthContext';
import { TavusProvider } from './context/TavusContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TavusProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/api" element={<ApiSettings />} />
                <Route path="chat/:personaId?" element={<Chat />} />
                <Route path="workouts" element={<WorkoutLibrary />} />
                <Route path="progress" element={<ProgressTracker />} />
                <Route path="form-analysis" element={<FormAnalysisAI />} />
                <Route path="generate-workout" element={<WorkoutGenerator />} />
                <Route path="build-workout" element={<WorkoutBuilder />} />
                <Route path="saved-workouts" element={<SavedWorkouts />} />
                <Route path="workout-session/:workoutId" element={<WorkoutSession />} />
                <Route path="clients" element={<Clients />} />
                <Route path="pricing" element={<SubscriptionPlans />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </TavusProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;