import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Keyboard, Settings2, RotateCcw, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { STREAMING_HOTKEYS } from '@/hooks/useHotkeys';

interface HotkeyBinding {
  id: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

interface HotkeyEditorProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  registeredHotkeys: { id: string; config: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean; description: string } }[];
  onUpdateHotkey: (id: string, newBinding: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }) => void;
  onResetHotkeys: () => void;
}

export function HotkeyEditor({
  isEnabled,
  onToggleEnabled,
  registeredHotkeys,
  onUpdateHotkey,
  onResetHotkeys,
}: HotkeyEditorProps) {
  const { toast } = useToast();
  const [editingHotkeyId, setEditingHotkeyId] = useState<string | null>(null);
  const [capturedKey, setCapturedKey] = useState<{ key: string; ctrl: boolean; shift: boolean; alt: boolean } | null>(null);

  const formatHotkey = (config: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }): string => {
    const parts: string[] = [];
    if (config.ctrl) parts.push('Ctrl');
    if (config.alt) parts.push('Alt');
    if (config.shift) parts.push('Shift');
    parts.push(config.key.toUpperCase());
    return parts.join(' + ');
  };

  const handleKeyCapture = useCallback((event: KeyboardEvent) => {
    if (!editingHotkeyId) return;
    
    event.preventDefault();
    event.stopPropagation();

    // Ignore modifier-only keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
      return;
    }

    const newBinding = {
      key: event.key,
      ctrl: event.ctrlKey || event.metaKey,
      shift: event.shiftKey,
      alt: event.altKey,
    };

    setCapturedKey(newBinding);
  }, [editingHotkeyId]);

  useEffect(() => {
    if (editingHotkeyId) {
      window.addEventListener('keydown', handleKeyCapture);
      return () => window.removeEventListener('keydown', handleKeyCapture);
    }
  }, [editingHotkeyId, handleKeyCapture]);

  const startEditing = (id: string) => {
    setEditingHotkeyId(id);
    setCapturedKey(null);
  };

  const confirmEdit = () => {
    if (editingHotkeyId && capturedKey) {
      onUpdateHotkey(editingHotkeyId, capturedKey);
      toast({
        title: 'Hotkey Updated',
        description: `New shortcut: ${formatHotkey(capturedKey)}`,
      });
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingHotkeyId(null);
    setCapturedKey(null);
  };

  const handleReset = () => {
    onResetHotkeys();
    toast({
      title: 'Hotkeys Reset',
      description: 'All shortcuts restored to defaults',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Keyboard className="w-4 h-4" />
          Hotkeys
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="hotkeys-enabled">Enable Hotkeys</Label>
            </div>
            <Switch
              id="hotkeys-enabled"
              checked={isEnabled}
              onCheckedChange={onToggleEnabled}
            />
          </div>

          {/* Editable Hotkeys List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Custom Shortcuts</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-xs gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] pr-3">
              {registeredHotkeys.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">
                  No hotkeys registered. Start streaming to see available shortcuts.
                </p>
              ) : (
                <div className="space-y-2">
                  {registeredHotkeys.map(({ id, config }) => (
                    <Card 
                      key={id}
                      className={`p-3 transition-colors ${editingHotkeyId === id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{config.description}</span>
                        
                        {editingHotkeyId === id ? (
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="font-mono text-xs min-w-[80px] justify-center bg-background animate-pulse"
                            >
                              {capturedKey ? formatHotkey(capturedKey) : 'Press keys...'}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={confirmEdit}
                              disabled={!capturedKey}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(id)}
                            className="font-mono text-xs"
                          >
                            {formatHotkey(config)}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Click on a shortcut to rebind it. Press your desired key combination, 
              then confirm with the check button. Hotkeys are disabled while typing in input fields.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
