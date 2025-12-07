import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Keyboard, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { STREAMING_HOTKEYS } from '@/hooks/useHotkeys';

interface HotkeySettingsProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  registeredHotkeys: { id: string; config: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean; description: string } }[];
}

export const HotkeySettings = ({
  isEnabled,
  onToggleEnabled,
  registeredHotkeys,
}: HotkeySettingsProps) => {
  const formatHotkey = (config: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }): string => {
    const parts: string[] = [];
    if (config.ctrl) parts.push('Ctrl');
    if (config.alt) parts.push('Alt');
    if (config.shift) parts.push('Shift');
    parts.push(config.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Keyboard className="w-4 h-4" />
          Hotkeys
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
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

          {/* Registered Hotkeys List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Active Shortcuts</h4>
            {registeredHotkeys.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No hotkeys registered</p>
            ) : (
              <div className="space-y-2">
                {registeredHotkeys.map(({ id, config }) => (
                  <div 
                    key={id}
                    className="flex items-center justify-between p-2 bg-background rounded-lg border"
                  >
                    <span className="text-sm">{config.description}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatHotkey(config)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Default Hotkeys Reference */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Default Shortcuts</h4>
            <div className="grid gap-1 text-sm">
              {Object.entries(STREAMING_HOTKEYS).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">{value.description}</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatHotkey(value)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
