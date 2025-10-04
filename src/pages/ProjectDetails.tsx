import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, Users, MapPin, Zap, MessageSquare } from 'lucide-react';
import { mockProjects, mockScripts, Script } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScript, setNewScript] = useState({ title: '', content: '' });
  const [scripts, setScripts] = useState<Script[]>([]);

  const project = mockProjects.find(p => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      setScripts(mockScripts.filter(s => s.project_id === projectId));
    }
  }, [projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScript.title.trim()) {
      toast.error('Please enter a script title');
      return;
    }

    const script: Script = {
      id: String(mockScripts.length + scripts.length + 1),
      project_id: projectId!,
      title: newScript.title,
      content: newScript.content,
      created_at: new Date().toISOString(),
    };

    setScripts([...scripts, script]);
    mockScripts.push(script);
    toast.success('Script created successfully!');
    setIsDialogOpen(false);
    setNewScript({ title: '', content: '' });
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 -ml-2"
        >
          ← Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card 
          className="hover:shadow-soft transition-all cursor-pointer"
          onClick={() => navigate(`/project/${projectId}/entities`)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Entities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View characters, locations, and events
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-soft transition-all cursor-pointer"
          onClick={() => navigate(`/project/${projectId}/qa`)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">Q&A</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ask questions about your story
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Powered by advanced analysis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Scripts</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Script
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Script</DialogTitle>
                <DialogDescription>
                  Add a new chapter, scene, or section to your project
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Chapter 1: The Beginning"
                    value={newScript.title}
                    onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  Create Script
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scripts?.map((script) => (
          <Card
            key={script.id}
            className="hover:shadow-elevated transition-all cursor-pointer animate-fade-in"
            onClick={() => navigate(`/script/${script.id}`)}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate text-base">{script.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {script.content ? `${script.content.substring(0, 60)}...` : 'Empty script'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {scripts && scripts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No scripts yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first script to start writing
          </p>
        </div>
      )}
    </div>
  );
}
