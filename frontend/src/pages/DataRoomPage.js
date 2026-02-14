import { useState, useEffect, useCallback } from 'react';
import { dataRoomAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FolderOpen,
  Sparkles,
  Trash2,
  RefreshCw,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  PieChart
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

const CATEGORY_ICONS = {
  summary: FileText,
  financials: BarChart3,
  legal: FileText,
  previous_funding: TrendingUp,
  intellectual_property: FileText,
  staff: FileText,
  metrics: PieChart,
  other: FolderOpen
};

const DataRoomPage = () => {
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadCategory, setUploadCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadDocuments(selectedCategory);
    } else {
      loadDocuments();
    }
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const [categoriesRes, docsRes] = await Promise.all([
        dataRoomAPI.getCategories(),
        dataRoomAPI.getAll()
      ]);
      setCategories(categoriesRes.data);
      setDocuments(docsRes.data);
    } catch (error) {
      toast.error('Failed to load data room');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (category = null) => {
    try {
      const response = await dataRoomAPI.getAll(category);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCategory) {
      toast.error('Please select a category first');
      return;
    }

    setUploading(true);
    try {
      const response = await dataRoomAPI.upload(file, uploadCategory);
      toast.success('Document uploaded successfully!');
      setDocuments(prev => [response.data, ...prev]);
      setSelectedDoc(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (docId) => {
    setAnalyzing(true);
    try {
      const response = await dataRoomAPI.analyze(docId);
      setSelectedDoc(response.data);
      setDocuments(prev => prev.map(d => d.id === docId ? response.data : d));
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await dataRoomAPI.delete(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
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

  const getCategoryLabel = (value) => {
    const cat = categories.find(c => c.value === value);
    return cat?.label || value;
  };

  const getDocCountByCategory = (categoryValue) => {
    return documents.filter(d => d.category === categoryValue).length;
  };

  const analysis = selectedDoc?.analysis?.analysis;

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="data-room-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl uppercase tracking-tight">Data Room</h1>
            <p className="text-muted-foreground font-body">Organize and analyze your investor documents</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.value] || FolderOpen;
            const count = getDocCountByCategory(cat.value);
            const isSelected = selectedCategory === cat.value;
            
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(isSelected ? null : cat.value)}
                className={`p-4 border text-left transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                data-testid={`category-${cat.value}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-heading text-2xl font-bold">{count}</span>
                </div>
                <p className="font-heading text-sm uppercase tracking-tight">{cat.label}</p>
                <p className="font-mono text-xs text-muted-foreground truncate">{cat.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & List */}
          <div className="space-y-6">
            {/* Upload Zone */}
            <Card className="rounded-none border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg uppercase tracking-tight">Upload Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger className="rounded-none border-border" data-testid="category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="rounded-none">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className={`border-2 border-dashed rounded-none p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 ${
                  uploadCategory ? 'border-border hover:border-primary/50' : 'border-muted opacity-50 cursor-not-allowed'
                }`}>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={!uploadCategory || uploading}
                    accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx,.csv"
                    data-testid="file-input"
                  />
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="font-mono text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="font-body text-sm text-muted-foreground">
                        {uploadCategory ? 'Click to upload' : 'Select category first'}
                      </span>
                    </>
                  )}
                </label>
              </CardContent>
            </Card>

            {/* Document List */}
            <Card className="rounded-none border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg uppercase tracking-tight">
                  {selectedCategory ? getCategoryLabel(selectedCategory) : 'All Documents'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground font-body text-sm">No documents yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-3 border cursor-pointer transition-all ${
                            selectedDoc?.id === doc.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedDoc(doc)}
                          data-testid={`doc-item-${doc.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="font-body text-sm truncate">{doc.filename}</span>
                            </div>
                            {getStatusBadge(doc.status)}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-xs text-muted-foreground uppercase">
                              {getCategoryLabel(doc.category)}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
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
            {selectedDoc ? (
              <Card className="rounded-none border-border bg-card h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-xl uppercase tracking-tight">
                      {selectedDoc.filename}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(selectedDoc.status)}
                      <span className="font-mono text-xs text-muted-foreground uppercase">
                        {getCategoryLabel(selectedDoc.category)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedDoc.status !== 'analyzed' && (
                      <Button
                        onClick={() => handleAnalyze(selectedDoc.id)}
                        disabled={analyzing || selectedDoc.status === 'analyzing'}
                        className="rounded-none font-heading uppercase tracking-wider text-xs glow-primary"
                        data-testid="analyze-doc-btn"
                      >
                        {analyzing || selectedDoc.status === 'analyzing' ? (
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
                    {selectedDoc.status === 'analyzed' && (
                      <Button
                        onClick={() => handleAnalyze(selectedDoc.id)}
                        variant="outline"
                        className="rounded-none font-heading uppercase tracking-wider text-xs"
                        data-testid="reanalyze-doc-btn"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-analyze
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(selectedDoc.id)}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      data-testid="delete-doc-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedDoc.status === 'analyzing' ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                      <p className="font-heading text-lg uppercase">Analyzing Document</p>
                      <p className="text-muted-foreground font-body text-sm mt-2">
                        Our AI is reviewing your document...
                      </p>
                    </div>
                  ) : analysis ? (
                    <DataRoomAnalysisDisplay analysis={analysis} />
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
                  <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="font-heading text-xl uppercase">Select a Document</p>
                  <p className="text-muted-foreground font-body text-sm mt-2">
                    Upload or select a document to view analysis
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

const DataRoomAnalysisDisplay = ({ analysis }) => {
  if (!analysis) return null;

  // Handle raw feedback if JSON parsing failed
  if (analysis.raw_feedback) {
    return (
      <div className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap font-body text-sm">{analysis.raw_feedback}</pre>
      </div>
    );
  }

  const chartColors = ['#FF4F00', '#FF6B35', '#FF8A5B', '#FFA07A', '#FFB694'];

  return (
    <Tabs defaultValue="overview" className="w-full" data-testid="analysis-tabs">
      <TabsList className="grid grid-cols-4 rounded-none bg-muted/50 p-1">
        <TabsTrigger value="overview" className="rounded-none font-mono text-xs uppercase">Overview</TabsTrigger>
        <TabsTrigger value="findings" className="rounded-none font-mono text-xs uppercase">Findings</TabsTrigger>
        <TabsTrigger value="improvements" className="rounded-none font-mono text-xs uppercase">Improve</TabsTrigger>
        <TabsTrigger value="visualizations" className="rounded-none font-mono text-xs uppercase">Charts</TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[500px] mt-4">
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Document Type & Score */}
          <div className="grid grid-cols-2 gap-4">
            {analysis.document_type && (
              <div className="p-6 border border-border">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Document Type</p>
                <p className="font-heading text-xl uppercase mt-1">{analysis.document_type}</p>
              </div>
            )}
            {analysis.completeness_score && (
              <div className="p-6 border border-border">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Completeness</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-heading text-4xl font-bold text-primary">{analysis.completeness_score}</span>
                  <span className="font-heading text-xl text-muted-foreground">/10</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div className="p-6 border border-border">
              <h3 className="font-heading text-lg uppercase mb-3">Summary</h3>
              <p className="font-body text-muted-foreground">{analysis.summary}</p>
            </div>
          )}

          {/* Investor Readiness */}
          {analysis.investor_readiness && (
            <div className="p-6 border border-border">
              <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Investor Readiness
              </h3>
              <p className="font-body text-muted-foreground">{analysis.investor_readiness}</p>
            </div>
          )}

          {/* Red Flags */}
          {analysis.red_flags && analysis.red_flags.length > 0 && (
            <div className="p-6 border border-red-500/30 bg-red-500/5">
              <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Red Flags
              </h3>
              <ul className="space-y-2">
                {analysis.red_flags.map((flag, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">!</span>
                    <span className="font-body text-muted-foreground">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="findings" className="space-y-6 mt-0">
          {/* Key Findings */}
          {analysis.key_findings && analysis.key_findings.length > 0 && (
            <div className="p-6 border border-border">
              <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Key Findings
              </h3>
              <ul className="space-y-2">
                {analysis.key_findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="font-body">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Information */}
          {analysis.missing_information && analysis.missing_information.length > 0 && (
            <div className="p-6 border border-border">
              <h3 className="font-heading text-lg uppercase mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Missing Information
              </h3>
              <ul className="space-y-2">
                {analysis.missing_information.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span className="font-body text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4 mt-0">
          {analysis.improvements && analysis.improvements.length > 0 ? (
            analysis.improvements.map((item, index) => (
              <div key={index} className={`p-6 border ${
                item.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
                item.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
                'border-border'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-lg uppercase">{item.area}</h3>
                  {item.priority && (
                    <span className={`font-mono text-xs uppercase px-2 py-1 ${
                      item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                  )}
                </div>
                {item.current_state && (
                  <div className="mb-3">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">Current State</p>
                    <p className="font-body text-muted-foreground">{item.current_state}</p>
                  </div>
                )}
                {item.recommendation && (
                  <div className="p-4 bg-primary/5 border-l-2 border-primary">
                    <p className="font-mono text-xs uppercase tracking-wider text-primary mb-1">Recommendation</p>
                    <p className="font-body">{item.recommendation}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
              <p className="text-muted-foreground font-body">No improvements needed</p>
            </div>
          )}

          {/* Next Steps */}
          {analysis.next_steps && analysis.next_steps.length > 0 && (
            <div className="p-6 border border-border mt-6">
              <h3 className="font-heading text-lg uppercase mb-3">Next Steps</h3>
              <div className="space-y-2">
                {analysis.next_steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/20">
                    <div className="w-6 h-6 bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-heading font-bold text-primary text-sm">{index + 1}</span>
                    </div>
                    <p className="font-body">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6 mt-0">
          {analysis.data_visualization_suggestions && analysis.data_visualization_suggestions.length > 0 ? (
            <>
              <div className="p-6 border border-border">
                <h3 className="font-heading text-lg uppercase mb-4">Suggested Visualizations</h3>
                <div className="space-y-4">
                  {analysis.data_visualization_suggestions.map((viz, index) => (
                    <div key={index} className="p-4 border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span className="font-mono text-xs uppercase tracking-wider text-primary">
                          {viz.chart_type}
                        </span>
                      </div>
                      <p className="font-heading text-sm uppercase mb-1">{viz.title}</p>
                      <p className="font-body text-muted-foreground text-sm">{viz.data_to_visualize}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Chart Preview */}
              <div className="p-6 border border-border">
                <h3 className="font-heading text-lg uppercase mb-4">Sample Visualization</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Q1', value: 400 },
                    { name: 'Q2', value: 300 },
                    { name: 'Q3', value: 500 },
                    { name: 'Q4', value: 700 }
                  ]}>
                    <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} />
                    <YAxis stroke="#A1A1AA" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0A0A', 
                        border: '1px solid #262626',
                        borderRadius: '0'
                      }}
                    />
                    <Bar dataKey="value" fill="#FF4F00" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="font-mono text-xs text-muted-foreground mt-2 text-center">
                  Sample data visualization based on AI suggestions
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-body">No visualizations suggested</p>
            </div>
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

export default DataRoomPage;
