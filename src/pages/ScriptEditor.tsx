import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { scriptsApi, UpdateScriptData } from '@/api/scripts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from '@/components/Loader';
import { toast } from 'sonner';

export default function ScriptEditor() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const { data: script, isLoading } = useQuery({
    queryKey: ['script', scriptId],
    queryFn: async () => {
      const response = await scriptsApi.getById(Number(scriptId));
      return response.data;
    },
    enabled: !!scriptId,
  });

  useEffect(() => {
    if (script) {
      setTitle(script.title);
      setContent(script.content || '');
    }
  }, [script]);

  useEffect(() => {
    if (script) {
      setHasChanges(
        title !== script.title || content !== (script.content || '')
      );
    }
  }, [title, content, script]);

  // Poll for analysis status
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const response = await scriptsApi.getTaskStatus(taskId);
        const status = response.data.status;
        setAnalysisStatus(status);

        if (status === 'COMPLETED') {
          toast.success('Analysis completed successfully!');
          clearInterval(interval);
          setTaskId(null);
        } else if (status === 'FAILED') {
          toast.error('Analysis failed');
          clearInterval(interval);
          setTaskId(null);
        }
      } catch (error) {
        console.error('Error polling task status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [taskId]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateScriptData) => 
      scriptsApi.update(Number(scriptId), data),
    onSuccess: () => {
      toast.success('Script saved successfully!');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save script');
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => scriptsApi.analyze(Number(scriptId)),
    onSuccess: (response) => {
      setTaskId(response.data.task_id);
      setAnalysisStatus('PROCESSING');
      toast.success('Analysis started!');
    },
    onError: () => {
      toast.error('Failed to start analysis');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ title, content });
  };

  const handleAnalyze = () => {
    if (hasChanges) {
      toast.error('Please save your changes before analyzing');
      return;
    }
    analyzeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader text="Loading script..." />
      </div>
    );
  }

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
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleAnalyze}
            disabled={hasChanges || analyzeMutation.isPending || !!taskId}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {analyzeMutation.isPending ? 'Starting...' : 'Analyze Script'}
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
