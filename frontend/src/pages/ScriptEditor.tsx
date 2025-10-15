import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { mockScripts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function ScriptEditor() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const script = mockScripts.find(s => s.id === scriptId);

  useEffect(() => {
    if (script) {
      setTitle(script.title);
      setContent(script.content);
    }
  }, [script]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a script title');
      return;
    }
    
    const scriptIndex = mockScripts.findIndex(s => s.id === scriptId);
    if (scriptIndex !== -1) {
      mockScripts[scriptIndex].title = title;
      mockScripts[scriptIndex].content = content;
    }
    
    toast.success('Script saved successfully!');
  };

  const handleAnalyze = () => {
    setAnalysisStatus('PROCESSING');
    toast.success('Analysis started! This may take a few moments...');
    
    setTimeout(() => {
      setAnalysisStatus('COMPLETED');
      toast.success('Analysis completed!');
    }, 3000);
  };

  if (!script) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Script not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/project/${script.project_id}`)}
          className="mb-4 -ml-2"
        >
          ← Back to Project
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Label htmlFor="title" className="text-sm font-medium mb-2">
              Script Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold h-auto py-2"
              placeholder="Enter script title..."
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="secondary" onClick={handleAnalyze}>
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Script
          </Button>
        </div>

        {analysisStatus && (
          <Alert className={
            analysisStatus === 'COMPLETED' 
              ? 'border-accent bg-accent/5' 
              : analysisStatus === 'FAILED'
              ? 'border-destructive bg-destructive/5'
              : 'border-primary bg-primary/5'
          }>
            <div className="flex items-center gap-2">
              {analysisStatus === 'PROCESSING' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {analysisStatus === 'COMPLETED' && (
                <CheckCircle2 className="h-4 w-4 text-accent" />
              )}
              {analysisStatus === 'FAILED' && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <AlertDescription>
                Analysis status: <strong>{analysisStatus}</strong>
                {analysisStatus === 'PROCESSING' && ' - This may take a minute...'}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div>
          <Label htmlFor="content" className="text-sm font-medium mb-2">
            Content
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] font-mono text-sm leading-relaxed"
            placeholder="Start writing your story here..."
          />
        </div>

        <div className="text-xs text-muted-foreground">
          {content.length} characters · {content.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>
    </div>
  );
}
