import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Loader2, 
  RefreshCw, 
  Download,
  Wand2,
  Sparkles
} from 'lucide-react';

const styles = [
  { value: 'enhanced', label: 'Enhanced Quality' },
  { value: 'vibrant', label: 'Vibrant Colors' },
  { value: 'dramatic', label: 'Dramatic Lighting' },
  { value: 'minimal', label: 'Minimal & Clean' },
  { value: 'gaming', label: 'Gaming Style' },
  { value: 'professional', label: 'Professional' },
];

export function ThumbnailRecreator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [recreatedImage, setRecreatedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('enhanced');
  const [customPrompt, setCustomPrompt] = useState('');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setRecreatedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRecreate = async () => {
    if (!originalImage) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload a thumbnail to recreate.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-thumbnail-recreate', {
        body: { 
          imageUrl: originalImage, 
          style,
          customPrompt 
        }
      });

      if (error) throw error;

      setRecreatedImage(data.imageUrl);
      toast({
        title: 'Thumbnail Recreated! ✨',
        description: 'Your enhanced thumbnail is ready.',
      });
    } catch (error) {
      console.error('[THUMBNAIL-RECREATOR] Error:', error);
      toast({
        title: 'Recreation Failed',
        description: 'Unable to recreate thumbnail. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (recreatedImage) {
      const link = document.createElement('a');
      link.href = recreatedImage;
      link.download = 'recreated-thumbnail.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          Thumbnail Recreator
        </CardTitle>
        <CardDescription>
          Upload an existing thumbnail and AI will recreate it with improvements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            {originalImage ? (
              <div className="space-y-4">
                <img
                  src={originalImage}
                  alt="Original thumbnail"
                  className="max-h-40 mx-auto rounded-lg shadow-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Upload your existing thumbnail
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <Label>Recreation Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styles.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <Label>Custom Instructions (Optional)</Label>
          <Input
            placeholder="e.g., Add more contrast, make text larger..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>

        <Button
          onClick={handleRecreate}
          disabled={loading || !originalImage}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Recreating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Recreate Thumbnail
            </>
          )}
        </Button>

        {/* Result */}
        {recreatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              Recreated Thumbnail
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Original</p>
                <img
                  src={originalImage!}
                  alt="Original"
                  className="w-full rounded-lg border border-border"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Recreated</p>
                <img
                  src={recreatedImage}
                  alt="Recreated"
                  className="w-full rounded-lg border border-primary/50 shadow-lg"
                />
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Recreated Thumbnail
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
