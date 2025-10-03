import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStreamSchedule } from '@/hooks/useStreamSchedule';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { AITitleGenerator } from '@/components/ai/AITitleGenerator';
import { AIThumbnailGenerator } from '@/components/ai/AIThumbnailGenerator';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stream Schedule</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Stream
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule a New Stream</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="ai-title">🤖 AI Title</TabsTrigger>
                <TabsTrigger value="ai-thumbnail">🎨 AI Thumbnail</TabsTrigger>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Stream description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                    <SelectTrigger>
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border pointer-events-auto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleCreate} disabled={!selectedDate || !title}>
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
        {schedules.map((schedule) => (
          <div key={schedule.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{schedule.title}</h3>
                <p className="text-sm text-muted-foreground">{schedule.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                schedule.status === 'scheduled' ? 'bg-blue-500/20 text-blue-500' :
                schedule.status === 'live' ? 'bg-green-500/20 text-green-500' :
                schedule.status === 'completed' ? 'bg-gray-500/20 text-gray-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {schedule.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {format(new Date(schedule.scheduled_start_time), 'PPp')}
            </div>
            <div className="text-sm">
              <span className="font-medium">{schedule.platform}</span> • {schedule.duration} minutes
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteSchedule(schedule.id)}
              className="w-full"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
