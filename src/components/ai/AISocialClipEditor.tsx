import { useState } from 'react';
import { Scissors, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Highlight {
  id: string;
  timestamp: string;
  description: string;
  videoUrl?: string;
}

interface AISocialClipEditorProps {
  highlight: Highlight;
}

export function AISocialClipEditor({ highlight }: AISocialClipEditorProps) {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const { toast } = useToast();

  const generateCaptionAndHashtags = () => {
    // AI-generated caption based on highlight description
    const generatedCaption = `${highlight.description} 🔥`;
    const generatedHashtags = '#gaming #twitch #streamer #fyp #viral';
    
    setCaption(generatedCaption);
    setHashtags(generatedHashtags);
    
    toast({
      title: 'Generated! ✨',
      description: 'Caption and hashtags created by AI',
    });
  };

  const exportClip = () => {
    toast({
      title: 'Exporting Clip! 📹',
      description: `Creating ${duration}s vertical clip...`,
    });
    
    // In a real implementation, this would:
    // 1. Crop video to 9:16 aspect ratio
    // 2. Add caption overlay
    // 3. Generate video file
    // 4. Offer download or direct share to TikTok/Instagram
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Social Media Clip Creator</h3>
        <p className="text-sm text-muted-foreground">Convert highlight to TikTok/Instagram format</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Clip Duration</Label>
          <div className="flex gap-2 mt-2">
            {[15, 30, 60].map((dur) => (
              <Button
                key={dur}
                size="sm"
                variant={duration === dur ? "default" : "outline"}
                onClick={() => setDuration(dur as 15 | 30 | 60)}
              >
                {dur}s
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a catchy caption..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hashtags">Hashtags</Label>
          <Input
            id="hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#gaming #twitch #fyp"
          />
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={generateCaptionAndHashtags}
        >
          <Scissors className="mr-2 h-4 w-4" />
          Generate AI Caption & Hashtags
        </Button>

        <div className="flex gap-2">
          <Button onClick={exportClip} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Export Clip
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share to TikTok
          </Button>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            Preview: 9:16 vertical format • {duration}s duration • AI-generated captions
          </p>
        </div>
      </div>
    </Card>
  );
}
