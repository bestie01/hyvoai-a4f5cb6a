import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { STREAMING_HOTKEYS } from '@/hooks/useHotkeys';

interface HotkeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

interface HotkeyConfig extends HotkeyBinding {
  action: () => void;
  description: string;
  enabled?: boolean;
}

interface StoredHotkeys {
  [id: string]: HotkeyBinding;
}

const STORAGE_KEY = 'hyvo-custom-hotkeys';

export function useCustomHotkeys() {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(true);
  const [customBindings, setCustomBindings] = useState<StoredHotkeys>({});
  const hotkeysRef = useRef<Map<string, HotkeyConfig>>(new Map());

  // Load custom bindings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomBindings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load custom hotkeys:', error);
    }
  }, []);

  // Save custom bindings to localStorage
  const saveCustomBindings = useCallback((bindings: StoredHotkeys) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
      setCustomBindings(bindings);
    } catch (error) {
      console.error('Failed to save custom hotkeys:', error);
    }
  }, []);

  const formatHotkeyDisplay = useCallback((config: HotkeyBinding): string => {
    const parts: string[] = [];
    if (config.ctrl) parts.push('Ctrl');
    if (config.alt) parts.push('Alt');
    if (config.shift) parts.push('Shift');
    parts.push(config.key.toUpperCase());
    return parts.join(' + ');
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const [id, config] of hotkeysRef.current.entries()) {
      if (config.enabled === false) continue;

      // Get the effective binding (custom or default)
      const effectiveBinding = customBindings[id] || config;

      const keyMatch = event.key.toLowerCase() === effectiveBinding.key.toLowerCase();
      const ctrlMatch = !!effectiveBinding.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = !!effectiveBinding.shift === event.shiftKey;
      const altMatch = !!effectiveBinding.alt === event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        event.stopPropagation();
        
        config.action();
        
        toast({
          title: 'Hotkey Triggered',
          description: `${config.description} (${formatHotkeyDisplay(effectiveBinding)})`,
          duration: 1500,
        });
        
        break;
      }
    }
  }, [isEnabled, customBindings, toast, formatHotkeyDisplay]);

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

  const updateHotkey = useCallback((id: string, newBinding: HotkeyBinding) => {
    const newBindings = { ...customBindings, [id]: newBinding };
    saveCustomBindings(newBindings);
  }, [customBindings, saveCustomBindings]);

  const resetHotkeys = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomBindings({});
  }, []);

  const getRegisteredHotkeys = useCallback(() => {
    return Array.from(hotkeysRef.current.entries()).map(([id, config]) => {
      const effectiveBinding = customBindings[id] || config;
      return {
        id,
        config: {
          ...config,
          key: effectiveBinding.key,
          ctrl: effectiveBinding.ctrl,
          shift: effectiveBinding.shift,
          alt: effectiveBinding.alt,
        },
      };
    });
  }, [customBindings]);

  return {
    registerHotkey,
    unregisterHotkey,
    updateHotkey,
    resetHotkeys,
    getRegisteredHotkeys,
    isEnabled,
    setEnabled: setIsEnabled,
    customBindings,
  };
}
