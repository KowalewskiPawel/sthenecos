import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clientService, ClientWithProgress } from '../services/clientService';
import Button from '../components/ui/Button';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Calendar,
  TrendingUp,
  MessageSquare,
  Dumbbell,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  Award,
  Target,
  Brain,
  Plus,
  AlertTriangle,
  CheckCircle,
  Loader,
  Info
} from 'lucide-react';

const Clients: React.FC = () => {
  const { user, isTrainer } = useAuth();
  const [clients, setClients] = useState<ClientWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<ClientWithProgress | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [addingClient, setAddingClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && isTrainer()) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const clientsData = await clientService.getTrainerClients(user.id);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not a trainer
  if (!isTrainer()) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-4">Trainer Access Required</h1>
          <p className="text-text-secondary mb-6">
            This page is only available for trainers. Switch to trainer mode in your settings to access client management.
          </p>
          <div className="space-x-4">
            <Link to="/settings">
              <Button variant="primary">Go to Settings</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-text-secondary bg-background';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'inactive': return 'text-red-400 bg-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-text-secondary bg-background';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddClient = async () => {
    if (!newClientEmail.trim() || !user) return;
    
    setAddingClient(true);
    setError(null);
    setSuccess(null);
    
    try {
      const newClient = await clientService.addClientToTrainer(user.id, newClientEmail.trim());
      setClients(prev => [newClient, ...prev]);
      setNewClientEmail('');
      setShowAddClient(false);
      setSuccess(`Successfully added ${newClient.client.name} as your client!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error adding client:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to add client';
      
      if (error.message.includes('does not exist')) {
        errorMessage = 'User with this email is not registered on Stheneco yet. Ask them to create an account first, then try adding them again.';
      } else if (error.message.includes('already your client')) {
        errorMessage = 'This user is already in your client list.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setAddingClient(false);
    }
  };

  const handleRemoveClient = async (relationshipId: string) => {
    try {
      await clientService.removeClient(relationshipId);
      setClients(prev => prev.filter(c => c.id !== relationshipId));
      setSelectedClient(null);
      setSuccess('Client removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error removing client:', error);
      setError('Failed to remove client');
    }
  };

  const handleUpdateStatus = async (relationshipId: string, status: 'active' | 'inactive' | 'pending') => {
    try {
      await clientService.updateClientStatus(relationshipId, status);
      setClients(prev => prev.map(c => 
        c.id === relationshipId ? { ...c, status } : c
      ));
      setSuccess(`Client status updated to ${status}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating client status:', error);
      setError('Failed to update client status');
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading your clients...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/dashboard" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-text-primary">Client Management</h1>
            <p className="text-text-secondary">
              Manage your training clients and track their progress
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowAddClient(true)}
            className="flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Total Clients</p>
                <p className="text-2xl font-bold text-text-primary">{clients.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Active Clients</p>
                <p className="text-2xl font-bold text-text-primary">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Avg Progress</p>
                <p className="text-2xl font-bold text-text-primary">
                  {clients.length > 0 
                    ? Math.round(clients.reduce((sum, c) => sum + c.progress_score, 0) / clients.length)
                    : 0
                  }%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Total Workouts</p>
                <p className="text-2xl font-bold text-text-primary">
                  {clients.reduce((sum, c) => sum + c.total_workouts, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 border border-background mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search Clients
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="w-full flex items-center justify-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Clients List */}
        <div className="bg-card rounded-xl border border-background overflow-hidden">
          <div className="p-6 border-b border-background">
            <h3 className="text-lg font-semibold text-text-primary">
              Your Clients ({filteredClients.length})
            </h3>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {clients.length === 0 ? 'No Clients Yet' : 'No Matching Clients'}
              </h3>
              <p className="text-text-secondary mb-6">
                {clients.length === 0 
                  ? 'Start building your client base by adding your first client'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {clients.length === 0 && (
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddClient(true)}
                  className="flex items-center mx-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-background">
              {filteredClients.map((clientRelation) => (
                <div key={clientRelation.id} className="p-6 hover:bg-background transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {clientRelation.client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-text-primary">{clientRelation.client.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(clientRelation.status)}`}>
                            {clientRelation.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(clientRelation.client.fitness_level)}`}>
                            {clientRelation.client.fitness_level}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {clientRelation.client.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {formatDate(clientRelation.created_at)}
                          </div>
                          {clientRelation.last_workout && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Last workout {formatDate(clientRelation.last_workout)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Dumbbell className="h-3 w-3 mr-1 text-primary" />
                            <span className="text-text-primary font-medium">{clientRelation.total_workouts}</span>
                            <span className="text-text-secondary ml-1">workouts</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                            <span className="text-text-primary font-medium">{clientRelation.progress_score}%</span>
                            <span className="text-text-secondary ml-1">progress</span>
                          </div>
                        </div>
                        
                        {clientRelation.client.fitness_goals && clientRelation.client.fitness_goals.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {clientRelation.client.fitness_goals.slice(0, 3).map((goal, index) => (
                              <span key={index} className="bg-background text-text-secondary px-2 py-1 rounded text-xs">
                                {goal}
                              </span>
                            ))}
                            {clientRelation.client.fitness_goals.length > 3 && (
                              <span className="text-text-secondary text-xs">
                                +{clientRelation.client.fitness_goals.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link to={`/generate-workout?client=${clientRelation.client_id}`}>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Brain className="h-3 w-3 mr-1" />
                          Create Workout
                        </Button>
                      </Link>
                      
                      <Link to={`/chat?client=${clientRelation.client_id}`}>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClient(clientRelation)}
                        className="flex items-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Client Modal */}
        {showAddClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Add New Client</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-4 py-2 bg-background border border-background rounded-lg focus:outline-none focus:border-primary text-text-primary"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-blue-400 text-sm">
                      <p className="font-medium mb-1">Important:</p>
                      <p>The user must already be registered on Stheneco. If they haven't signed up yet, ask them to create an account first at stheneco.com</p>
                    </div>
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
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddClient(false);
                    setNewClientEmail('');
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddClient}
                  disabled={!newClientEmail.trim() || addingClient}
                  className="flex-1"
                >
                  {addingClient ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Client Details Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-background p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{selectedClient.client.name}</h3>
                    <p className="text-text-secondary">{selectedClient.client.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Client stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-background p-4 rounded-lg text-center">
                    <Dumbbell className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-text-primary">{selectedClient.total_workouts}</p>
                    <p className="text-text-secondary text-sm">total workouts</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg text-center">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xl font-bold text-text-primary">{selectedClient.progress_score}%</p>
                    <p className="text-text-secondary text-sm">progress score</p>
                  </div>
                </div>

                {/* Status Management */}
                <div className="mb-6">
                  <h4 className="font-medium text-text-primary mb-3">Client Status</h4>
                  <div className="flex space-x-2">
                    {['active', 'inactive', 'pending'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedClient.status === status ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedClient.id, status as any)}
                        className="capitalize"
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Fitness goals */}
                {selectedClient.client.fitness_goals && selectedClient.client.fitness_goals.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-text-primary mb-3">Fitness Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.client.fitness_goals.map((goal, index) => (
                        <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-3 mb-4">
                  <Link to={`/generate-workout?client=${selectedClient.client_id}`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Create Workout
                    </Button>
                  </Link>
                  <Link to={`/chat?client=${selectedClient.client_id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                </div>

                {/* Remove client */}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this client?')) {
                      handleRemoveClient(selectedClient.id);
                    }
                  }}
                  className="w-full text-red-400 border-red-500 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Client
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;