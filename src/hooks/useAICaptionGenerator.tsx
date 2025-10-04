import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAICaptionGenerator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCaptioning = useCallback(async (targetLanguage: string = 'en') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);

          // Convert to base64 and send for transcription
          const reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];

            setLoading(true);
            const { data, error } = await supabase.functions.invoke('ai-caption-generator', {
              body: { audio: base64Audio, targetLanguage }
            });
            setLoading(false);

            if (!error && data?.text) {
              setCaptions(prev => [...prev.slice(-4), data.text]); // Keep last 5 captions
            }
          };
        }
      };

      // Record in 3-second chunks for real-time captions
      mediaRecorder.start();
      setIsRecording(true);

      const intervalId = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, 3000);

      // Store interval ID for cleanup
      (mediaRecorder as any).intervalId = intervalId;

    } catch (error) {
      console.error('[AI-CAPTION-GENERATOR] Error:', error);
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopCaptioning = useCallback(() => {
    if (mediaRecorderRef.current) {
      const intervalId = (mediaRecorderRef.current as any).intervalId;
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setCaptions([]);
    }
  }, []);

  return {
    startCaptioning,
    stopCaptioning,
    captions,
    isRecording,
    loading,
  };
}
