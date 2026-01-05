import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Streaming
  { keys: ['Ctrl', 'Shift', 'L'], description: 'Go Live / End Stream', category: 'Streaming' },
  { keys: ['Ctrl', 'M'], description: 'Toggle Microphone', category: 'Streaming' },
  { keys: ['Ctrl', 'Shift', 'M'], description: 'Toggle Camera', category: 'Streaming' },
  { keys: ['Ctrl', 'R'], description: 'Start/Stop Recording', category: 'Streaming' },
  
  // Scenes
  { keys: ['1-9'], description: 'Switch to Scene 1-9', category: 'Scenes' },
  { keys: ['Ctrl', 'S'], description: 'Save Current Scene', category: 'Scenes' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate Scene', category: 'Scenes' },
  
  // Navigation
  { keys: ['Ctrl', 'H'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['Ctrl', ','], description: 'Open Settings', category: 'Navigation' },
  { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'Navigation' },
  
  // AI Features
  { keys: ['Ctrl', 'T'], description: 'Generate AI Titles', category: 'AI Features' },
  { keys: ['Ctrl', 'I'], description: 'Generate AI Thumbnail', category: 'AI Features' },
  { keys: ['Ctrl', 'Shift', 'A'], description: 'Toggle AI Moderation', category: 'AI Features' },
];

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = [...new Set(shortcuts.map(s => s.category))];

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-shadow"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Quick access to common actions. Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">?</kbd> anytime to show this menu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
                <div className="space-y-2">
                  {shortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm text-foreground">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono font-medium border border-border">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Pro tip: Customize shortcuts in Settings → Hotkeys
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
