import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useAITitleGenerator } from '@/hooks/useAITitleGenerator';
import { useToast } from '@/hooks/use-toast';

interface AITitleGeneratorProps {
  onSelectTitle?: (title: string, description: string) => void;
  defaultGame?: string;
}

export function AITitleGenerator({ onSelectTitle, defaultGame }: AITitleGeneratorProps) {
  const [game, setGame] = useState(defaultGame || '');
  const [theme, setTheme] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { generateTitles, result, loading } = useAITitleGenerator();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!game) {
      toast({
        title: 'Game Required',
        description: 'Please enter a game or category',
        variant: 'destructive',
      });
      return;
    }
    generateTitles(game, theme, targetAudience);
  };

  const handleCopyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: 'Copied! 📋',
      description: 'Title copied to clipboard',
    });
  };

  const handleSelectTitle = (title: string, index: number) => {
    setSelectedTitle(index);
    if (onSelectTitle && result) {
      onSelectTitle(title, result.descriptions[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="game">Game/Category *</Label>
          <Input
            id="game"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="e.g., Valorant"
          />
        </div>
        <div>
          <Label htmlFor="theme">Theme (optional)</Label>
          <Input
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., competitive"
          />
        </div>
        <div>
          <Label htmlFor="audience">Target Audience (optional)</Label>
          <Input
            id="audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., casual gamers"
          />
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={loading || !game}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating AI Titles...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Titles
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Generated Titles:</h3>
            <div className="space-y-2">
              {result.titles.map((title, index) => (
                <Card 
                  key={index}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                    selectedTitle === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectTitle(title, index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyTitle(title, index);
                      }}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Description Options:</h3>
            <div className="space-y-2">
              {result.descriptions.map((desc, index) => (
                <Card key={index} className="p-3">
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}