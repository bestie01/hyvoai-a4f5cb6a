import { useEffect, useCallback } from 'react';
import { useCustomHotkeys } from '@/hooks/useCustomHotkeys';
import { HotkeyEditor } from './HotkeyEditor';
import { STREAMING_HOTKEYS } from '@/hooks/useHotkeys';

interface HotkeyManagerProps {
  onStartStream: () => void;
  onStopStream: () => void;
  onToggleMic: () => void;
  onToggleDesktopAudio?: () => void;
  onSwitchScene?: (sceneIndex: number) => void;
  onCreateClip?: () => void;
  isStreaming: boolean;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export const HotkeyManager = ({
  onStartStream,
  onStopStream,
  onToggleMic,
  onToggleDesktopAudio,
  onSwitchScene,
  onCreateClip,
  isStreaming,
  isRecording,
  onStartRecording,
  onStopRecording,
}: HotkeyManagerProps) => {
  const { 
    registerHotkey, 
    unregisterHotkey, 
    updateHotkey,
    resetHotkeys,
    getRegisteredHotkeys,
    isEnabled,
    setEnabled 
  } = useCustomHotkeys();

  const handleStreamToggle = useCallback(() => {
    if (isStreaming) {
      onStopStream();
    } else {
      onStartStream();
    }
  }, [isStreaming, onStartStream, onStopStream]);

  const handleRecordingToggle = useCallback(() => {
    if (isRecording) {
      onStopRecording?.();
    } else {
      onStartRecording?.();
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  // Register all hotkeys on mount
  useEffect(() => {
    registerHotkey('start-stream', {
      key: STREAMING_HOTKEYS.START_STREAM.key,
      action: handleStreamToggle,
      description: STREAMING_HOTKEYS.START_STREAM.description,
    });

    registerHotkey('start-recording', {
      key: STREAMING_HOTKEYS.START_RECORDING.key,
      action: handleRecordingToggle,
      description: STREAMING_HOTKEYS.START_RECORDING.description,
    });

    registerHotkey('mute-mic', {
      ...STREAMING_HOTKEYS.MUTE_MIC,
      action: onToggleMic,
    });

    if (onToggleDesktopAudio) {
      registerHotkey('mute-desktop', {
        ...STREAMING_HOTKEYS.MUTE_DESKTOP,
        action: onToggleDesktopAudio,
      });
    }

    if (onSwitchScene) {
      registerHotkey('scene-1', {
        ...STREAMING_HOTKEYS.SCENE_1,
        action: () => onSwitchScene(0),
      });
      registerHotkey('scene-2', {
        ...STREAMING_HOTKEYS.SCENE_2,
        action: () => onSwitchScene(1),
      });
      registerHotkey('scene-3', {
        ...STREAMING_HOTKEYS.SCENE_3,
        action: () => onSwitchScene(2),
      });
      registerHotkey('scene-4', {
        ...STREAMING_HOTKEYS.SCENE_4,
        action: () => onSwitchScene(3),
      });
    }

    if (onCreateClip) {
      registerHotkey('create-clip', {
        ...STREAMING_HOTKEYS.CREATE_CLIP,
        action: onCreateClip,
      });
    }

    return () => {
      unregisterHotkey('start-stream');
      unregisterHotkey('start-recording');
      unregisterHotkey('mute-mic');
      unregisterHotkey('mute-desktop');
      unregisterHotkey('scene-1');
      unregisterHotkey('scene-2');
      unregisterHotkey('scene-3');
      unregisterHotkey('scene-4');
      unregisterHotkey('create-clip');
    };
  }, [
    registerHotkey, 
    unregisterHotkey, 
    handleStreamToggle, 
    handleRecordingToggle,
    onToggleMic, 
    onToggleDesktopAudio, 
    onSwitchScene, 
    onCreateClip
  ]);

  return (
    <HotkeyEditor
      isEnabled={isEnabled}
      onToggleEnabled={setEnabled}
      registeredHotkeys={getRegisteredHotkeys()}
      onUpdateHotkey={updateHotkey}
      onResetHotkeys={resetHotkeys}
    />
  );
};
