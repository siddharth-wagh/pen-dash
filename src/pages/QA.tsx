import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import { mockQA } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface QAItem {
  question: string;
  answer: string;
}

export default function QA() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<QAItem[]>(mockQA);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const newQA: QAItem = {
      question: question,
      answer: 'This is a demo response. In a real application, this would be an AI-generated answer based on your story content.',
    };

    setConversation([...conversation, newQA]);
    setQuestion('');
    toast.success('Answer generated!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/project/${projectId}`)}
          className="mb-4 -ml-2"
        >
          ← Back to Project
        </Button>
        <h1 className="text-4xl font-bold mb-2">Story Q&A</h1>
        <p className="text-muted-foreground">
          Ask questions about your story and get AI-powered insights
        </p>
      </div>

      <div className="space-y-6">
        {conversation.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No questions yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Ask anything about your story - character motivations, plot holes, 
                timeline questions, or get creative suggestions
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversation.map((item, index) => (
              <div key={index} className="space-y-3">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">You asked:</p>
                        <p className="text-foreground">{item.question}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-accent">AI</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Answer:</p>
                        <p className="text-foreground whitespace-pre-wrap">{item.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sticky bottom-4">
          <Card className="shadow-elevated">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know about your story?"
                  className="min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <Button type="submit" disabled={!question.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Ask
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
