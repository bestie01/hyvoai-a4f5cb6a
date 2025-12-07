import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Pause, Play, Download, StopCircle, HardDrive } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDownload: () => void;
  hasRecording: boolean;
  disabled?: boolean;
}

export const RecordingControls = ({
  isRecording,
  isPaused,
  duration,
  onStart,
  onStop,
  onPause,
  onResume,
  onDownload,
  hasRecording,
  disabled = false,
}: RecordingControlsProps) => {
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HardDrive className="w-5 h-5 text-primary" />
            Local Recording
          </CardTitle>
          {isRecording && (
            <Badge 
              variant={isPaused ? "secondary" : "destructive"} 
              className="gap-1 font-mono"
            >
              {isPaused ? (
                <>
                  <Pause className="w-3 h-3" />
                  PAUSED
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Circle className="w-3 h-3 fill-current" />
                  </motion.div>
                  REC
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Duration Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-foreground">
            {formatDuration(duration)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isRecording ? (isPaused ? 'Recording Paused' : 'Recording...') : 'Ready to Record'}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          {!isRecording ? (
            <Button
              onClick={onStart}
              disabled={disabled}
              className="gap-2"
              variant="default"
            >
              <Circle className="w-4 h-4 fill-current" />
              Start Recording
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button onClick={onResume} variant="outline" className="gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={onPause} variant="outline" className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button onClick={onStop} variant="destructive" className="gap-2">
                <StopCircle className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Download Button */}
        {hasRecording && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <Button onClick={onDownload} variant="secondary" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download Last Recording
            </Button>
          </motion.div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Recordings are saved locally in WebM format</p>
          <p>Hotkey: F10 to toggle recording</p>
        </div>
      </CardContent>
    </Card>
  );
};
