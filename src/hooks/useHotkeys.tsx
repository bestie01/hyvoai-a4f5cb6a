import { useEffect, useCallback, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  enabled?: boolean;
}

interface UseHotkeysReturn {
  registerHotkey: (id: string, config: HotkeyConfig) => void;
  unregisterHotkey: (id: string) => void;
  getRegisteredHotkeys: () => { id: string; config: HotkeyConfig }[];
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useHotkeys = (): UseHotkeysReturn => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(true);
  const hotkeysRef = useRef<Map<string, HotkeyConfig>>(new Map());

  const formatHotkeyDisplay = useCallback((config: HotkeyConfig): string => {
    const parts: string[] = [];
    if (config.ctrl) parts.push('Ctrl');
    if (config.alt) parts.push('Alt');
    if (config.shift) parts.push('Shift');
    if (config.meta) parts.push('⌘');
    parts.push(config.key.toUpperCase());
    return parts.join(' + ');
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const [id, config] of hotkeysRef.current.entries()) {
      if (config.enabled === false) continue;

      const keyMatch = event.key.toLowerCase() === config.key.toLowerCase();
      const ctrlMatch = !!config.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = !!config.shift === event.shiftKey;
      const altMatch = !!config.alt === event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        event.stopPropagation();
        
        config.action();
        
        toast({
          title: "Hotkey Triggered",
          description: `${config.description} (${formatHotkeyDisplay(config)})`,
          duration: 1500,
        });
        
        break;
      }
    }
  }, [isEnabled, toast, formatHotkeyDisplay]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const registerHotkey = useCallback((id: string, config: HotkeyConfig) => {
    hotkeysRef.current.set(id, { ...config, enabled: config.enabled !== false });
  }, []);

  const unregisterHotkey = useCallback((id: string) => {
    hotkeysRef.current.delete(id);
  }, []);

  const getRegisteredHotkeys = useCallback(() => {
    return Array.from(hotkeysRef.current.entries()).map(([id, config]) => ({
      id,
      config,
    }));
  }, []);

  return {
    registerHotkey,
    unregisterHotkey,
    getRegisteredHotkeys,
    isEnabled,
    setEnabled: setIsEnabled,
  };
};

// Default hotkey presets for streaming
export const STREAMING_HOTKEYS = {
  START_STREAM: { key: 'F9', description: 'Start/Stop Stream' },
  START_RECORDING: { key: 'F10', description: 'Start/Stop Recording' },
  MUTE_MIC: { key: 'm', ctrl: true, shift: true, description: 'Toggle Microphone' },
  MUTE_DESKTOP: { key: 'd', ctrl: true, shift: true, description: 'Toggle Desktop Audio' },
  SCENE_1: { key: '1', ctrl: true, description: 'Switch to Scene 1' },
  SCENE_2: { key: '2', ctrl: true, description: 'Switch to Scene 2' },
  SCENE_3: { key: '3', ctrl: true, description: 'Switch to Scene 3' },
  SCENE_4: { key: '4', ctrl: true, description: 'Switch to Scene 4' },
  TOGGLE_PREVIEW: { key: 'p', ctrl: true, shift: true, description: 'Toggle Preview' },
  CREATE_CLIP: { key: 'c', ctrl: true, shift: true, description: 'Create Instant Clip' },
};
