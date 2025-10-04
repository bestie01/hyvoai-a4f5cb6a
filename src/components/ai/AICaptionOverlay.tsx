import { useState } from 'react';
import { Captions, CaptionsOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAICaptionGenerator } from '@/hooks/useAICaptionGenerator';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
];

export function AICaptionOverlay() {
  const [language, setLanguage] = useState('en');
  const { startCaptioning, stopCaptioning, captions, isRecording, loading } = useAICaptionGenerator();

  const handleToggle = () => {
    if (isRecording) {
      stopCaptioning();
    } else {
      startCaptioning(language);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">AI Live Captions</h3>
        <p className="text-sm text-muted-foreground">Real-time transcription with translation</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption-language">Caption Language</Label>
        <Select value={language} onValueChange={setLanguage} disabled={isRecording}>
          <SelectTrigger id="caption-language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleToggle}
        variant={isRecording ? "destructive" : "default"}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isRecording ? (
          <>
            <CaptionsOff className="mr-2 h-4 w-4" />
            Stop Captions
          </>
        ) : (
          <>
            <Captions className="mr-2 h-4 w-4" />
            Start Captions
          </>
        )}
      </Button>

      {captions.length > 0 && (
        <div className="space-y-2">
          <Label>Live Captions:</Label>
          <div className="bg-muted rounded-lg p-4 min-h-[100px] space-y-2">
            {captions.map((caption, index) => (
              <p key={index} className="text-sm">
                {caption}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
