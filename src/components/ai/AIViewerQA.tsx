import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAIViewerQA } from '@/hooks/useAIViewerQA';
import { MessageSquare, Plus, Bot, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function AIViewerQA() {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [testQuestion, setTestQuestion] = useState('');
  const [testAnswer, setTestAnswer] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { answerQuestion, addKnowledge, getKnowledge, loading } = useAIViewerQA();
  const { toast } = useToast();

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    const { data } = await getKnowledge();
    if (data) setKnowledge(data);
  };

  const handleAddKnowledge = async () => {
    if (!newQuestion || !newAnswer) {
      toast({
        title: 'Fields Required',
        description: 'Please enter both question and answer',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await addKnowledge(newQuestion, newAnswer);
    if (!error) {
      setNewQuestion('');
      setNewAnswer('');
      setDialogOpen(false);
      loadKnowledge();
    }
  };

  const handleTest = async () => {
    if (!testQuestion) return;
    
    const { data } = await answerQuestion(testQuestion);
    if (data) {
      setTestAnswer(data.answer);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('viewer_qa_knowledge')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({
        title: 'Deleted',
        description: 'Q&A removed from knowledge base',
      });
      loadKnowledge();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Viewer Q&A Bot</h3>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Q&A
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Knowledge Base</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What mouse do you use?"
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="I use a Logitech G Pro Wireless"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddKnowledge} className="w-full">
                  Add to Knowledge Base
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Test Area */}
        <div className="space-y-3 mb-4">
          <Label>Test Q&A Bot</Label>
          <div className="flex gap-2">
            <Input
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              placeholder="Ask a question..."
              onKeyDown={(e) => e.key === 'Enter' && handleTest()}
            />
            <Button onClick={handleTest} disabled={loading}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
          {testAnswer && (
            <Card className="p-3 bg-accent">
              <p className="text-sm">{testAnswer}</p>
            </Card>
          )}
        </div>

        {/* Knowledge Base */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Knowledge Base</Label>
            <Badge variant="outline">{knowledge.length} Q&As</Badge>
          </div>
          
          {knowledge.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No Q&As yet. Add common questions your viewers ask!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {knowledge.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Q: {item.question}</p>
                      <p className="text-sm text-muted-foreground mb-2">A: {item.answer}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Used {item.usage_count || 0} times
                        </Badge>
                        {item.auto_respond && (
                          <Badge variant="outline" className="text-xs">
                            Auto-respond ON
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}