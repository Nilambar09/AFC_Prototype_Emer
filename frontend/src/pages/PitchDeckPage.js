import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pitchDeckAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Image,
  Type,
  Target,
  TrendingUp,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

const PitchDeckPage = () => {
  const { deckId } = useParams();
  const [pitchDecks, setPitchDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPitchDecks();
  }, []);

  useEffect(() => {
    if (deckId) {
      loadSingleDeck(deckId);
    }
  }, [deckId]);

  const loadPitchDecks = async () => {
    try {
      const response = await pitchDeckAPI.getAll();
      setPitchDecks(response.data);
      if (!deckId && response.data.length > 0) {
        setSelectedDeck(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load pitch decks');
    } finally {
      setLoading(false);
    }
  };

  const loadSingleDeck = async (id) => {
    try {
      const response = await pitchDeckAPI.getOne(id);
      setSelectedDeck(response.data);
    } catch (error) {
      toast.error('Failed to load pitch deck');
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await pitchDeckAPI.upload(file);
      toast.success('Pitch deck uploaded successfully!');
      setPitchDecks(prev => [response.data, ...prev]);
      setSelectedDeck(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  const handleAnalyze = async (deckId) => {
    setAnalyzing(true);
    try {
      const response = await pitchDeckAPI.analyze(deckId);
      setSelectedDeck(response.data);
      setPitchDecks(prev => prev.map(d => d.id === deckId ? response.data : d));
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this pitch deck?')) return;
    
    try {
      await pitchDeckAPI.delete(deckId);
      setPitchDecks(prev => prev.filter(d => d.id !== deckId));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(pitchDecks.filter(d => d.id !== deckId)[0] || null);
      }
      toast.success('Pitch deck deleted');
    } catch (error) {
      toast.error('Failed to delete pitch deck');
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

  const analysis = selectedDeck?.analysis?.analysis;

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="pitch-deck-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl uppercase tracking-tight">Pitch Deck Analyzer</h1>
            <p className="text-muted-foreground font-body">Upload and get AI-powered feedback on your pitch deck</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & List */}
          <div className="space-y-6">
            {/* Upload Zone */}
            <Card className="rounded-none border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg uppercase tracking-tight">Upload Deck</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-none p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  data-testid="upload-dropzone"
                >
                  <input {...getInputProps()} data-testid="file-input" />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="font-mono text-sm">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="font-body text-sm text-muted-foreground">
                        {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground/70">PDF, PPTX, PNG, JPG</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deck List */}
            <Card className="rounded-none border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg uppercase tracking-tight">Your Decks</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : pitchDecks.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground font-body text-sm">No pitch decks yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pitchDecks.map((deck) => (
                        <div
                          key={deck.id}
                          className={`p-3 border cursor-pointer transition-all ${
                            selectedDeck?.id === deck.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedDeck(deck)}
                          data-testid={`deck-item-${deck.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="font-body text-sm truncate">{deck.filename}</span>
                            </div>
                            {getStatusBadge(deck.status)}
                          </div>
                          <p className="font-mono text-xs text-muted-foreground mt-1">
                            {new Date(deck.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Analysis */}
          <div className="lg:col-span-2">
            {selectedDeck ? (
              <Card className="rounded-none border-border bg-card h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-xl uppercase tracking-tight">
                      {selectedDeck.filename}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(selectedDeck.status)}
                      <span className="font-mono text-xs text-muted-foreground">
                        {(selectedDeck.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedDeck.status !== 'analyzed' && (
                      <Button
                        onClick={() => handleAnalyze(selectedDeck.id)}
                        disabled={analyzing || selectedDeck.status === 'analyzing'}
                        className="rounded-none font-heading uppercase tracking-wider text-xs glow-primary"
                        data-testid="analyze-btn"
                      >
                        {analyzing || selectedDeck.status === 'analyzing' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    )}
                    {selectedDeck.status === 'analyzed' && (
                      <Button
                        onClick={() => handleAnalyze(selectedDeck.id)}
                        variant="outline"
                        className="rounded-none font-heading uppercase tracking-wider text-xs"
                        data-testid="reanalyze-btn"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-analyze
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(selectedDeck.id)}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      data-testid="delete-deck-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedDeck.status === 'analyzing' ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                      <p className="font-heading text-lg uppercase">Analyzing Your Deck</p>
                      <p className="text-muted-foreground font-body text-sm mt-2">
                        Our AI is reviewing your pitch deck...
                      </p>
                    </div>
                  ) : analysis ? (
                    <AnalysisDisplay analysis={analysis} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="font-heading text-lg uppercase">Ready to Analyze</p>
                      <p className="text-muted-foreground font-body text-sm mt-2">
                        Click the Analyze button to get AI feedback
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-none border-border bg-card h-full flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="font-heading text-xl uppercase">Select a Pitch Deck</p>
                  <p className="text-muted-foreground font-body text-sm mt-2">
                    Upload or select a pitch deck to view analysis
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const AnalysisDisplay = ({ analysis }) => {
  if (!analysis) return null;

  // Handle raw feedback if JSON parsing failed
  if (analysis.raw_feedback) {
    return (
      <div className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap font-body text-sm">{analysis.raw_feedback}</pre>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full" data-testid="analysis-tabs">
      <TabsList className="grid grid-cols-5 rounded-none bg-muted/50 p-1">
        <TabsTrigger value="overview" className="rounded-none font-mono text-xs uppercase">Overview</TabsTrigger>
        <TabsTrigger value="sections" className="rounded-none font-mono text-xs uppercase">Sections</TabsTrigger>
        <TabsTrigger value="content" className="rounded-none font-mono text-xs uppercase">Content</TabsTrigger>
        <TabsTrigger value="visuals" className="rounded-none font-mono text-xs uppercase">Visuals</TabsTrigger>
        <TabsTrigger value="next" className="rounded-none font-mono text-xs uppercase">Next Steps</TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[500px] mt-4">
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Score */}
          {analysis.overall_score && (
            <div className="flex items-center gap-4 p-6 border border-border bg-card/50">
              <div className="w-20 h-20 bg-primary/10 flex items-center justify-center">
                <span className="font-heading text-4xl font-bold text-primary">{analysis.overall_score}</span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Overall Score</p>
                <p className="font-heading text-xl uppercase">Out of 10</p>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          {analysis.executive_summary && (
            <div className="p-6 border border-border">
              <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Executive Summary
              </h3>
              <p className="font-body text-muted-foreground">{analysis.executive_summary}</p>
            </div>
          )}

          {/* Investor Perspective */}
          {analysis.investor_perspective && (
            <div className="p-6 border border-border">
              <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Investor Perspective
              </h3>
              <p className="font-body text-muted-foreground">{analysis.investor_perspective}</p>
            </div>
          )}

          {/* Missing Elements */}
          {analysis.missing_elements && analysis.missing_elements.length > 0 && (
            <div className="p-6 border border-border">
              <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Missing Elements
              </h3>
              <ul className="space-y-2">
                {analysis.missing_elements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span className="font-body text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sections" className="space-y-4 mt-0">
          {analysis.sections_analysis && analysis.sections_analysis.map((section, index) => (
            <div key={index} className="p-6 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg uppercase">{section.section}</h3>
                {section.score && (
                  <span className="font-heading text-2xl font-bold text-primary">{section.score}/10</span>
                )}
              </div>
              <p className="font-body text-muted-foreground mb-4">{section.feedback}</p>
              
              {section.improvements && section.improvements.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Improvements</p>
                  <ul className="space-y-1">
                    {section.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="font-body text-sm">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.example_rewrite && (
                <div className="mt-4 p-4 bg-muted/30 border-l-2 border-primary">
                  <p className="font-mono text-xs uppercase tracking-wider text-primary mb-2">Suggested Rewrite</p>
                  <p className="font-body text-sm italic">{section.example_rewrite}</p>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-0">
          {analysis.content_improvements && analysis.content_improvements.map((item, index) => (
            <div key={index} className="p-6 border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">Original</p>
                  <p className="font-body text-muted-foreground line-through">{item.original_text}</p>
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-green-400 mb-1">Suggested</p>
                  <p className="font-body">{item.suggested_text}</p>
                </div>
                {item.reason && (
                  <div className="pt-2 border-t border-border">
                    <p className="font-mono text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!analysis.content_improvements || analysis.content_improvements.length === 0) && (
            <div className="text-center py-8">
              <Type className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-body">No content improvements suggested</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="visuals" className="space-y-6 mt-0">
          {analysis.visual_recommendations && (
            <>
              {analysis.visual_recommendations.overall_design && (
                <div className="p-6 border border-border">
                  <h3 className="font-heading text-lg uppercase mb-3">Overall Design</h3>
                  <p className="font-body text-muted-foreground">{analysis.visual_recommendations.overall_design}</p>
                </div>
              )}

              {analysis.visual_recommendations.charts_needed && analysis.visual_recommendations.charts_needed.length > 0 && (
                <div className="p-6 border border-border">
                  <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Charts to Add
                  </h3>
                  <ul className="space-y-2">
                    {analysis.visual_recommendations.charts_needed.map((chart, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">+</span>
                        <span className="font-body">{chart}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.visual_recommendations.images_to_add && analysis.visual_recommendations.images_to_add.length > 0 && (
                <div className="p-6 border border-border">
                  <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                    <Image className="w-5 h-5 text-green-400" />
                    Images to Add
                  </h3>
                  <ul className="space-y-2">
                    {analysis.visual_recommendations.images_to_add.map((img, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">+</span>
                        <span className="font-body">{img}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.visual_recommendations.images_to_remove && analysis.visual_recommendations.images_to_remove.length > 0 && (
                <div className="p-6 border border-border">
                  <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                    <Image className="w-5 h-5 text-red-400" />
                    Images to Remove
                  </h3>
                  <ul className="space-y-2">
                    {analysis.visual_recommendations.images_to_remove.map((img, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">−</span>
                        <span className="font-body">{img}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="next" className="space-y-4 mt-0">
          {analysis.next_steps && analysis.next_steps.length > 0 ? (
            <div className="space-y-3">
              {analysis.next_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-border">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="font-body">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
              <p className="text-muted-foreground font-body">No specific next steps identified</p>
            </div>
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

export default PitchDeckPage;
