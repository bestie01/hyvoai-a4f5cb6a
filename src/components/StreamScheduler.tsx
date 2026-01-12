import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useStreamSchedule } from '@/hooks/useStreamSchedule';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import { AITitleGenerator } from '@/components/ai/AITitleGenerator';
import { AIThumbnailGenerator } from '@/components/ai/AIThumbnailGenerator';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const StreamScheduler = () => {
  const { schedules, loading, createSchedule, deleteSchedule } = useStreamSchedule();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<'twitch' | 'youtube'>('twitch');
  const [duration, setDuration] = useState(60);
  const [time, setTime] = useState('12:00');

  const handleCreate = async () => {
    if (!selectedDate || !title) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date(selectedDate);
    scheduledTime.setHours(hours, minutes, 0, 0);

    await createSchedule({
      title,
      description,
      platform,
      duration,
      scheduled_start_time: scheduledTime.toISOString(),
    });

    setOpen(false);
    setTitle('');
    setDescription('');
    setSelectedDate(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'live': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary">Stream Schedule</h2>
          <p className="text-muted-foreground text-sm mt-1">Plan and manage your upcoming streams</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="btn-glow">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Stream
            </Button>
          </DialogTrigger>
          <DialogContent className="liquid-glass-elevated max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Schedule a New Stream</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-3 liquid-glass-panel p-1">
                <TabsTrigger value="manual" className="data-[state=active]:bg-primary/20">Manual</TabsTrigger>
                <TabsTrigger value="ai-title" className="data-[state=active]:bg-primary/20">🤖 AI Title</TabsTrigger>
                <TabsTrigger value="ai-thumbnail" className="data-[state=active]:bg-primary/20">🎨 AI Thumbnail</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Stream Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter stream title"
                      className="liquid-glass-button"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Stream description (optional)"
                      className="liquid-glass-button"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                        <SelectTrigger className="liquid-glass-button">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twitch">Twitch</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="liquid-glass-button"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <div className="liquid-glass-panel rounded-lg p-2">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-md pointer-events-auto"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="liquid-glass-button"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleCreate} disabled={!selectedDate || !title} className="w-full btn-glow">
                  Create Schedule
                </Button>
              </TabsContent>
              <TabsContent value="ai-title" className="mt-4">
                <AITitleGenerator 
                  defaultGame={platform}
                  onSelectTitle={(t, d) => {
                    setTitle(t);
                    setDescription(d);
                  }}
                />
              </TabsContent>
              <TabsContent value="ai-thumbnail" className="mt-4">
                <AIThumbnailGenerator 
                  defaultTitle={title}
                  defaultGame={platform}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule, index) => (
          <motion.div
            key={schedule.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <LiquidGlassCard className="h-full">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{schedule.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{schedule.description}</p>
                  </div>
                  <Badge variant="outline" className={`ml-2 shrink-0 ${getStatusColor(schedule.status)}`}>
                    {schedule.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(schedule.scheduled_start_time), 'PPp')}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="h-4 w-4 text-primary" />
                      <span className="capitalize font-medium">{schedule.platform}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{schedule.duration} min</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSchedule(schedule.id)}
                  className="w-full liquid-glass-button text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </LiquidGlassCard>
          </motion.div>
        ))}
      </div>

      {schedules.length === 0 && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <LiquidGlassCard>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <CalendarIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">No scheduled streams</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first stream schedule to get started
              </p>
            </div>
          </LiquidGlassCard>
        </motion.div>
      )}
    </div>
  );
};
