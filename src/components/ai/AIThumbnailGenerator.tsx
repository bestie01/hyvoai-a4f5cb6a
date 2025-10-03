import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Download } from 'lucide-react';
import { useAIThumbnailGenerator } from '@/hooks/useAIThumbnailGenerator';
import { useToast } from '@/hooks/use-toast';

interface AIThumbnailGeneratorProps {
  defaultTitle?: string;
  defaultGame?: string;
}

export function AIThumbnailGenerator({ defaultTitle, defaultGame }: AIThumbnailGeneratorProps) {
  const [title, setTitle] = useState(defaultTitle || '');
  const [game, setGame] = useState(defaultGame || '');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const { generateThumbnails, thumbnails, loading } = useAIThumbnailGenerator();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!title || !game) {
      toast({
        title: 'Fields Required',
        description: 'Please enter both title and game',
        variant: 'destructive',
      });
      return;
    }
    generateThumbnails(title, game);
  };

  const handleDownload = (url: string, style: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumbnail-${style}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Downloaded! ⬇️',
      description: 'Thumbnail saved to your downloads',
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Stream Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Radiant Push Today!"
          />
        </div>
        <div>
          <Label htmlFor="game">Game *</Label>
          <Input
            id="game"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="e.g., Valorant"
          />
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={loading || !title || !game}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating AI Thumbnails (this may take 30s)...
          </>
        ) : (
          <>
            <ImageIcon className="mr-2 h-4 w-4" />
            Generate AI Thumbnails
          </>
        )}
      </Button>

      {thumbnails.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Generated Thumbnails:</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {thumbnails.map((thumbnail, index) => (
              <Card 
                key={index}
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectedIndex === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <div className="aspect-video relative">
                  <img 
                    src={thumbnail.url} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Style: {thumbnail.style}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(thumbnail.url, thumbnail.style);
                    }}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}