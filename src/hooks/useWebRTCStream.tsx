import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseWebRTCStreamReturn {
  isCapturing: boolean;
  streamRef: React.RefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startCapture: (captureType: 'camera' | 'screen' | 'both') => Promise<void>;
  stopCapture: () => void;
  getCaptureStats: () => MediaStreamStats;
}

interface MediaStreamStats {
  videoBitrate: number;
  audioBitrate: number;
  fps: number;
  resolution: { width: number; height: number };
}

export const useWebRTCStream = (): UseWebRTCStreamReturn => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const statsRef = useRef<MediaStreamStats>({
    videoBitrate: 0,
    audioBitrate: 0,
    fps: 30,
    resolution: { width: 1920, height: 1080 }
  });

  const startCapture = useCallback(async (captureType: 'camera' | 'screen' | 'both') => {
    try {
      let videoStream: MediaStream | null = null;
      let audioStream: MediaStream | null = null;

      // Capture video based on type
      if (captureType === 'camera' || captureType === 'both') {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 60 }
          }
        });
      } else if (captureType === 'screen') {
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 60 }
          },
          audio: true
        });
      }

      // Always capture audio from microphone
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      // Combine streams
      const tracks = [
        ...(videoStream?.getVideoTracks() || []),
        ...(audioStream?.getAudioTracks() || [])
      ];

      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Attach to video element if ref exists
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.muted = true; // Prevent feedback
        await videoRef.current.play();
      }

      // Update stats
      const videoTrack = combinedStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        statsRef.current.resolution = {
          width: settings.width || 1920,
          height: settings.height || 1080
        };
        statsRef.current.fps = settings.frameRate || 30;
      }

      setIsCapturing(true);
      
      toast({
        title: "Capture Started",
        description: `${captureType} capture is now active`,
      });

    } catch (error) {
      console.error('Error starting capture:', error);
      toast({
        title: "Capture Failed",
        description: "Could not start media capture",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
    
    toast({
      title: "Capture Stopped",
      description: "Media capture has been stopped",
    });
  }, [toast]);

  const getCaptureStats = useCallback(() => {
    return statsRef.current;
  }, []);

  return {
    isCapturing,
    streamRef,
    videoRef,
    startCapture,
    stopCapture,
    getCaptureStats,
  };
};
