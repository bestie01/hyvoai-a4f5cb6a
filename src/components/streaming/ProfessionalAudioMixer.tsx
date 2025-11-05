import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AudioMeter } from "./AudioMeter";
import { 
  Mic, 
  Monitor, 
  Volume2, 
  VolumeX,
  Music,
  Settings2
} from "lucide-react";

interface AudioChannel {
  id: string;
  name: string;
  icon: any;
  volume: number;
  muted: boolean;
  solo: boolean;
  level: number;
  effects: string[];
}

export const ProfessionalAudioMixer = () => {
  const [channels, setChannels] = useState<AudioChannel[]>([
    {
      id: "mic",
      name: "Microphone",
      icon: Mic,
      volume: 75,
      muted: false,
      solo: false,
      level: 45,
      effects: ["Noise Gate", "Compressor"]
    },
    {
      id: "desktop",
      name: "Desktop Audio",
      icon: Monitor,
      volume: 60,
      muted: false,
      solo: false,
      level: 65,
      effects: ["Limiter"]
    },
    {
      id: "music",
      name: "Background Music",
      icon: Music,
      volume: 35,
      muted: false,
      solo: false,
      level: 40,
      effects: ["EQ", "Reverb"]
    }
  ]);

  const updateChannel = (id: string, updates: Partial<AudioChannel>) => {
    setChannels(channels.map(ch => 
      ch.id === id ? { ...ch, ...updates } : ch
    ));
  };

  const toggleMute = (id: string) => {
    updateChannel(id, { muted: !channels.find(ch => ch.id === id)?.muted });
  };

  const toggleSolo = (id: string) => {
    const channel = channels.find(ch => ch.id === id);
    updateChannel(id, { solo: !channel?.solo });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="w-5 h-5 text-primary" />
          Audio Mixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {channels.map((channel, index) => {
          const Icon = channel.icon;
          
          return (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border"
            >
              {/* Channel Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{channel.name}</p>
                    <div className="flex gap-1 mt-1">
                      {channel.effects.map(effect => (
                        <Badge key={effect} variant="outline" className="text-xs py-0">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={channel.solo ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSolo(channel.id)}
                    className="h-8 w-12 text-xs"
                  >
                    S
                  </Button>
                  <Button
                    variant={channel.muted ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => toggleMute(channel.id)}
                    className="h-8 w-12"
                  >
                    {channel.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Audio Level Meter */}
              <AudioMeter level={channel.level} label="" />

              {/* Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-mono font-semibold">{channel.volume}%</span>
                </div>
                <Slider
                  value={[channel.volume]}
                  onValueChange={([value]) => updateChannel(channel.id, { volume: value })}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={channel.muted}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Master Output */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 border-t border-border space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Master Output</p>
            <Badge variant="outline" className="font-mono">-6.2 dB</Badge>
          </div>
          <AudioMeter level={55} label="" />
        </motion.div>
      </CardContent>
    </Card>
  );
};
