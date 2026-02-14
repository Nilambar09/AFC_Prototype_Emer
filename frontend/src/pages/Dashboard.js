import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, pitchDeckAPI, dataRoomAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
  FileText, 
  FolderOpen, 
  BarChart3, 
  Clock, 
  ArrowRight,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPitchDecks, setRecentPitchDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, pitchDecksRes] = await Promise.all([
        dashboardAPI.getStats(),
        pitchDeckAPI.getAll()
      ]);
      setStats(statsRes.data);
      setRecentPitchDecks(pitchDecksRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryChartData = () => {
    if (!stats?.documents_by_category) return [];
    const colors = ['#FF4F00', '#FF6B35', '#FF8A5B', '#FFA07A', '#FFB694', '#FFC9AD', '#FFDCC6', '#FFEFE0'];
    return Object.entries(stats.documents_by_category).map(([name, value], index) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value,
      color: colors[index % colors.length]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl uppercase tracking-tight">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground font-body">
              {user?.company_name || 'Your startup command center'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/pitch-deck">
              <Button className="rounded-none font-heading uppercase tracking-wider font-bold glow-primary" data-testid="analyze-deck-btn">
                <Upload className="w-4 h-4 mr-2" />
                Analyze Deck
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-none border-border bg-card hover:border-primary/50 transition-colors" data-testid="stat-pitch-decks">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Pitch Decks</p>
                  <p className="font-heading text-4xl font-bold mt-1">{stats?.total_pitch_decks || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border bg-card hover:border-primary/50 transition-colors" data-testid="stat-documents">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Data Room Docs</p>
                  <p className="font-heading text-4xl font-bold mt-1">{stats?.total_documents || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border bg-card hover:border-primary/50 transition-colors" data-testid="stat-analyzed">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Analyzed</p>
                  <p className="font-heading text-4xl font-bold mt-1">{stats?.analyzed_documents || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border bg-card hover:border-primary/50 transition-colors" data-testid="stat-pending">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Pending</p>
                  <p className="font-heading text-4xl font-bold mt-1">{stats?.pending_analysis || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Pitch Decks */}
          <Card className="rounded-none border-border bg-card lg:col-span-2" data-testid="recent-pitch-decks">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-xl uppercase tracking-tight">Recent Pitch Decks</CardTitle>
              <Link to="/pitch-deck">
                <Button variant="ghost" size="sm" className="rounded-none font-mono text-xs uppercase tracking-wider">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentPitchDecks.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-body">No pitch decks yet</p>
                  <Link to="/pitch-deck">
                    <Button variant="outline" className="mt-4 rounded-none font-heading uppercase tracking-wider">
                      Upload Your First Deck
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPitchDecks.map((deck) => (
                    <Link 
                      key={deck.id} 
                      to={`/pitch-deck/${deck.id}`}
                      className="flex items-center justify-between p-4 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-body font-medium truncate max-w-[200px]">{deck.filename}</p>
                          <p className="font-mono text-xs text-muted-foreground uppercase">
                            {new Date(deck.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deck.status)}
                        <span className={`font-mono text-xs uppercase tracking-wider px-2 py-1 ${
                          deck.status === 'analyzed' ? 'bg-green-500/20 text-green-400' :
                          deck.status === 'analyzing' ? 'bg-blue-500/20 text-blue-400' :
                          deck.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {deck.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="rounded-none border-border bg-card" data-testid="category-distribution">
            <CardHeader>
              <CardTitle className="font-heading text-xl uppercase tracking-tight">Data Room</CardTitle>
            </CardHeader>
            <CardContent>
              {getCategoryChartData().length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-body text-sm">No documents yet</p>
                  <Link to="/data-room">
                    <Button variant="outline" size="sm" className="mt-4 rounded-none font-heading uppercase tracking-wider text-xs">
                      Add Documents
                    </Button>
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getCategoryChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getCategoryChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0A0A', 
                        border: '1px solid #262626',
                        borderRadius: '0'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <Link to="/data-room">
                <Button variant="outline" className="w-full mt-4 rounded-none font-heading uppercase tracking-wider text-xs">
                  Manage Data Room
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/pitch-deck" className="group">
            <Card className="rounded-none border-border bg-card hover:border-primary/50 transition-all h-full" data-testid="quick-action-pitch">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-lg uppercase">Pitch Deck Analyzer</h3>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                      Upload and get AI feedback on your pitch deck
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/data-room" className="group">
            <Card className="rounded-none border-border bg-card hover:border-primary/50 transition-all h-full" data-testid="quick-action-dataroom">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-lg uppercase">Data Room</h3>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                      Manage all your investor documents
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/history" className="group">
            <Card className="rounded-none border-border bg-card hover:border-primary/50 transition-all h-full" data-testid="quick-action-history">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-lg uppercase">History</h3>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                      View and manage all your uploads
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
