import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AthleteDashboard from '../components/AthleteDashboard';
import TrainerDashboard from '../components/TrainerDashboard';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Render different dashboards based on user role
  if (user.user_role === 'trainer') {
    return <TrainerDashboard />;
  } else {
    return <AthleteDashboard />;
  }
};

export default Dashboard;