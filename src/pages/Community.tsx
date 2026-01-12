import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Trophy, Gift, Star, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import Footer from "@/components/Footer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [fanContent, setFanContent] = useState<any[]>([]);
  const [newEventOpen, setNewEventOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadEvents();
      loadFanContent();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .order('start_time', { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadFanContent = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_content')
        .select('*')
        .eq('streamer_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFanContent(data || []);
    } catch (error) {
      console.error('Error loading fan content:', error);
    }
  };

  const createEvent = async (eventData: any) => {
    try {
      const { error } = await supabase.from('community_events').insert({
        user_id: user?.id,
        ...eventData
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Event created successfully"
      });
      setNewEventOpen(false);
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'tournament':
        return <Trophy className="h-5 w-5" />;
      case 'giveaway':
        return <Gift className="h-5 w-5" />;
      case 'collab':
        return <Users className="h-5 w-5" />;
      case 'special_stream':
        return <Star className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen liquid-glass-bg relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2, ease: "easeInOut" }}
        />
      </div>

      <PageHeader
        title="Community Hub"
        description="Engage with your community"
        icon={Users}
        showBackButton={true}
        backPath="/dashboard"
      />

      <motion.div
        className="container mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Tabs defaultValue="events" className="space-y-6">
          <motion.div variants={itemVariants}>
            <TabsList className="liquid-glass-panel p-1">
              <TabsTrigger value="events" className="data-[state=active]:bg-primary/20">
                Events
              </TabsTrigger>
              <TabsTrigger value="fan-content" className="data-[state=active]:bg-primary/20">
                Fan Content
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="events" className="space-y-6">
            <ProFeatureGate feature="Community Event Management" description="Create and manage community events, tournaments, and watch parties with Pro.">
              <motion.div className="flex justify-end" variants={itemVariants}>
                <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-glow">
                      <Calendar className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="liquid-glass-elevated">
                    <DialogHeader>
                      <DialogTitle>Create Community Event</DialogTitle>
                      <DialogDescription>
                        Plan tournaments, giveaways, or special streams
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={e => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createEvent({
                        title: formData.get('title'),
                        description: formData.get('description'),
                        event_type: formData.get('event_type'),
                        start_time: new Date(formData.get('start_time') as string).toISOString(),
                        max_participants: parseInt(formData.get('max_participants') as string) || null
                      });
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Event Type</label>
                        <Select name="event_type" required>
                          <SelectTrigger className="liquid-glass-button">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tournament">Tournament</SelectItem>
                            <SelectItem value="giveaway">Giveaway</SelectItem>
                            <SelectItem value="collab">Collaboration</SelectItem>
                            <SelectItem value="special_stream">Special Stream</SelectItem>
                            <SelectItem value="meetup">Meetup</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input name="title" required placeholder="Event title" className="liquid-glass-button" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea name="description" placeholder="Event details" rows={3} className="liquid-glass-button" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <Input name="start_time" type="datetime-local" required className="liquid-glass-button" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Participants (optional)</label>
                        <Input name="max_participants" type="number" placeholder="Leave empty for unlimited" className="liquid-glass-button" />
                      </div>
                      <Button type="submit" className="w-full btn-glow">Create Event</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <LiquidGlassCard className="h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/20">
                              {getEventIcon(event.event_type)}
                            </div>
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="liquid-glass-badge">
                            {event.event_type}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(event.start_time).toLocaleDateString()} at{' '}
                          {new Date(event.start_time).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                        {event.max_participants && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{event.current_participants} / {event.max_participants} participants</span>
                          </div>
                        )}
                      </CardContent>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>

              {events.length === 0 && (
                <motion.div variants={itemVariants}>
                  <LiquidGlassCard>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="p-4 rounded-full bg-primary/10 mb-4">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-center">No upcoming events</p>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Create your first community event to get started
                      </p>
                    </CardContent>
                  </LiquidGlassCard>
                </motion.div>
              )}
            </ProFeatureGate>
          </TabsContent>

          <TabsContent value="fan-content" className="space-y-6">
            <ProFeatureGate feature="Fan Content Management" description="Showcase and manage fan art, clips, and user-generated content with Pro.">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fanContent.map((content, index) => (
                  <motion.div
                    key={content.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <LiquidGlassCard className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {content.content_url && (
                          <img src={content.content_url} alt={content.description} className="w-full h-full object-cover" />
                        )}
                        {content.is_featured && (
                          <Badge className="absolute top-2 right-2 bg-accent">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{content.fan_username}</CardTitle>
                          <Badge variant="outline" className="liquid-glass-badge">{content.content_type}</Badge>
                        </div>
                        <CardDescription>{content.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4" />
                          <span>{content.likes_count} likes</span>
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>

              {fanContent.length === 0 && (
                <motion.div variants={itemVariants}>
                  <LiquidGlassCard>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="p-4 rounded-full bg-primary/10 mb-4">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-center">No fan content yet</p>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Your community's creations will appear here
                      </p>
                    </CardContent>
                  </LiquidGlassCard>
                </motion.div>
              )}
            </ProFeatureGate>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Community;
