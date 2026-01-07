import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Loader2, 
  MessageSquare,
  Download,
  Wand2,
  History,
  RotateCcw
} from 'lucide-react';

interface EditHistory {
  instruction: string;
  imageUrl: string;
  timestamp: Date;
}

export function NaturalLanguageEditor() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [history, setHistory] = useState<EditHistory[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
        setEditedImage(null);
        setHistory([]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleEdit = async () => {
    if (!currentImage) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image to edit.',
        variant: 'destructive',
      });
      return;
    }

    if (!instruction.trim()) {
      toast({
        title: 'No Instruction',
        description: 'Please describe what changes you want.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-thumbnail-edit', {
        body: { 
          imageUrl: editedImage || currentImage, 
          instruction 
        }
      });

      if (error) throw error;

      // Add to history
      setHistory(prev => [
        { instruction, imageUrl: editedImage || currentImage!, timestamp: new Date() },
        ...prev
      ]);

      setEditedImage(data.imageUrl);
      setInstruction('');
      
      toast({
        title: 'Edit Applied! ✨',
        description: 'Your image has been updated.',
      });
    } catch (error) {
      console.error('[NL-EDITOR] Error:', error);
      toast({
        title: 'Edit Failed',
        description: 'Unable to apply edit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history[0];
      setEditedImage(lastState.imageUrl === currentImage ? null : lastState.imageUrl);
      setHistory(prev => prev.slice(1));
    }
  };

  const handleDownload = () => {
    const imageToDownload = editedImage || currentImage;
    if (imageToDownload) {
      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = 'edited-thumbnail.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exampleInstructions = [
    "Make the text larger and bolder",
    "Add a red glow effect around the edges",
    "Increase the contrast and saturation",
    "Add a subtle vignette effect",
    "Make the background darker",
    "Add lens flare from top right"
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Natural Language Editor
        </CardTitle>
        <CardDescription>
          Describe changes in plain English and AI will apply them
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
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            {currentImage ? (
              <img
                src={editedImage || currentImage}
                alt="Current image"
                className="max-h-48 mx-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="space-y-3 py-4">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Upload an image to edit
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instruction Input */}
        <div className="space-y-2">
          <Label>What would you like to change?</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Make the colors more vibrant..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleEdit()}
            />
            <Button
              onClick={handleEdit}
              disabled={loading || !currentImage || !instruction.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Example Instructions */}
        {currentImage && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Try these:</Label>
            <div className="flex flex-wrap gap-2">
              {exampleInstructions.slice(0, 4).map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInstruction(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {(editedImage || currentImage) && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}

        {/* Edit History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <History className="w-3 h-3" />
              Edit History
            </Label>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2 rounded bg-muted/50 text-muted-foreground"
                >
                  "{item.instruction}"
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
