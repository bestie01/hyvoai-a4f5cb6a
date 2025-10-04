import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  action: string;
  parameters?: Record<string, any>;
  response: string;
}

export function useAIVoiceAssistant() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      setRecognition(recognitionInstance);
    }
  }, []);

  const processCommand = useCallback(async (
    command: string,
    context?: Record<string, any>
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-voice-assistant', {
        body: { command, context }
      });

      if (error) {
        console.error('[AI-VOICE-ASSISTANT] Error:', error);
        return { data: null, error };
      }

      const result = data as VoiceCommand;

      toast({
        title: '🎙️ Command Understood',
        description: result.response,
      });

      return { data: result, error: null };
    } catch (error) {
      console.error('[AI-VOICE-ASSISTANT] Exception:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startListening = useCallback(() => {
    if (!recognition) {
      toast({
        title: 'Not Supported',
        description: 'Voice recognition is not supported in this browser',
        variant: 'destructive',
      });
      return;
    }

    setListening(true);
    recognition.start();

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript;
      console.log('[AI-VOICE-ASSISTANT] Heard:', command);
      await processCommand(command);
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('[AI-VOICE-ASSISTANT] Recognition error:', event.error);
      setListening(false);
      toast({
        title: 'Error',
        description: 'Could not understand voice command',
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, [recognition, processCommand, toast]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setListening(false);
    }
  }, [recognition]);

  return {
    processCommand,
    startListening,
    stopListening,
    listening,
    loading,
    supported: !!recognition,
  };
}
