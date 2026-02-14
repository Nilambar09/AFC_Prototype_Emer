import { useState, useEffect } from 'react';
import { historyAPI, pitchDeckAPI, dataRoomAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { 
  FileText, 
  FolderOpen,
  Loader2, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await historyAPI.getAll();
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setDeleting(item.id);
    try {
      if (item.type === 'pitch_deck') {
        await pitchDeckAPI.delete(item.id);
      } else {
        await dataRoomAPI.delete(item.id);
      }
      setHistory(prev => prev.filter(h => h.id !== item.id));
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await historyAPI.clear();
      setHistory([]);
      toast.success('History cleared successfully');
    } catch (error) {
      toast.error('Failed to clear history');
    } finally {
      setClearing(false);
    }
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

  const getStatusBadge = (status) => {
    const styles = {
      uploaded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      analyzing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      analyzed: 'bg-green-500/20 text-green-400 border-green-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
      <span className={`font-mono text-xs uppercase tracking-wider px-2 py-1 border ${styles[status] || styles.uploaded}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Group history by date
  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="history-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl uppercase tracking-tight">History</h1>
            <p className="text-muted-foreground font-body">View and manage all your uploaded documents</p>
          </div>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-none font-heading uppercase tracking-wider text-destructive border-destructive/50 hover:bg-destructive/10"
                  data-testid="clear-all-btn"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-none border-border bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading uppercase">Clear All History?</AlertDialogTitle>
                  <AlertDialogDescription className="font-body">
                    This will permanently delete all your pitch decks and data room documents. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-none font-heading uppercase tracking-wider">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAll}
                    className="rounded-none font-heading uppercase tracking-wider bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={clearing}
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      'Delete All'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-none border-border bg-card">
            <CardContent className="pt-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Total Items</p>
              <p className="font-heading text-3xl font-bold mt-1">{history.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-none border-border bg-card">
            <CardContent className="pt-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Pitch Decks</p>
              <p className="font-heading text-3xl font-bold mt-1">
                {history.filter(h => h.type === 'pitch_deck').length}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none border-border bg-card">
            <CardContent className="pt-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Data Room Docs</p>
              <p className="font-heading text-3xl font-bold mt-1">
                {history.filter(h => h.type === 'data_room').length}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none border-border bg-card">
            <CardContent className="pt-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Analyzed</p>
              <p className="font-heading text-3xl font-bold mt-1">
                {history.filter(h => h.has_analysis).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card className="rounded-none border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl uppercase tracking-tight">All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="font-heading text-xl uppercase">No History Yet</p>
                <p className="text-muted-foreground font-body text-sm mt-2">
                  Upload your first document to get started
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {Object.entries(groupedHistory).map(([date, items]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between p-4 border border-border hover:border-primary/30 transition-colors"
                            data-testid={`history-item-${item.id}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                {item.type === 'pitch_deck' ? (
                                  <FileText className="w-5 h-5 text-primary" />
                                ) : (
                                  <FolderOpen className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-body font-medium truncate max-w-[300px]">{item.filename}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`font-mono text-xs uppercase px-2 py-0.5 ${
                                    item.type === 'pitch_deck' 
                                      ? 'bg-blue-500/20 text-blue-400' 
                                      : 'bg-purple-500/20 text-purple-400'
                                  }`}>
                                    {item.type === 'pitch_deck' ? 'Pitch Deck' : item.category?.replace('_', ' ')}
                                  </span>
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {formatDate(item.created_at).time}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusIcon(item.status)}
                              {getStatusBadge(item.status)}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item)}
                                disabled={deleting === item.id}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                data-testid={`delete-item-${item.id}`}
                              >
                                {deleting === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
