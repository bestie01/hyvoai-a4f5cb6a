import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

interface UseLocalRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  startRecording: (stream: MediaStream, options?: RecordingOptions) => void;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadRecording: (filename?: string) => void;
}

export const useLocalRecording = (): UseLocalRecordingReturn => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  const getSupportedMimeType = useCallback(() => {
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ];
    
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return 'video/webm';
  }, []);

  const startRecording = useCallback((stream: MediaStream, options?: RecordingOptions) => {
    try {
      const mimeType = options?.mimeType || getSupportedMimeType();
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: options?.videoBitsPerSecond || 8000000,
        audioBitsPerSecond: options?.audioBitsPerSecond || 128000
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        recordedBlobRef.current = blob;
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: "Recording Error",
          description: "An error occurred during recording",
          variant: "destructive",
        });
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Local recording is now active",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not start local recording",
        variant: "destructive",
      });
    }
  }, [getSupportedMimeType, toast]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        recordedBlobRef.current = blob;
        
        setIsRecording(false);
        setIsPaused(false);
        
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        toast({
          title: "Recording Stopped",
          description: `Recording saved (${(blob.size / 1024 / 1024).toFixed(2)} MB)`,
        });

        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [toast]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      toast({
        title: "Recording Paused",
        description: "Local recording is paused",
      });
    }
  }, [toast]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Resumed",
        description: "Local recording is active again",
      });
    }
  }, [toast]);

  const downloadRecording = useCallback((filename?: string) => {
    if (!recordedBlobRef.current) {
      toast({
        title: "No Recording",
        description: "No recording available to download",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(recordedBlobRef.current);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `hyvo-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your recording is being downloaded",
    });
  }, [toast]);

  return {
    isRecording,
    isPaused,
    recordingDuration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
  };
};
