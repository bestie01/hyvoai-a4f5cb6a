import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Users, MessageCircle, Eye, Share2, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { PageHeader } from "@/components/ui/page-header";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import Footer from "@/components/Footer";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

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

const Growth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { postToTwitter, postToDiscord, fetchScheduledPosts, posting } = useSocialPosts();
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  
  const [postContent, setPostContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("twitter");
  const [scheduleTime, setScheduleTime] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");

  useEffect(() => {
    if (user) {
      loadGrowthMetrics();
      loadScheduledPosts();
    }
  }, [user]);

  const loadGrowthMetrics = async () => {
    if (!user?.id) return;
    
    try {
      const { data: analytics } = await supabase
        .from('stream_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(30);

      if (analytics) {
        const chartData = analytics.map((item, index) => ({
          name: `Day ${index + 1}`,
          viewers: item.viewers,
          messages: item.messages,
          engagement: Number(item.engagement_rate),
        }));
        setGrowthData(chartData);

        const platforms = analytics.reduce((acc: any, curr: any) => {
          const existing = acc.find((p: any) => p.name === curr.platform);
          if (existing) {
            existing.value += curr.viewers;
          } else {
            acc.push({ name: curr.platform, value: curr.viewers });
          }
          return acc;
        }, []);
        setPlatformData(platforms);
      }
    } catch (error) {
      console.error('Error loading growth metrics:', error);
    }
  };

  const loadScheduledPosts = async () => {
    const posts = await fetchScheduledPosts();
    setScheduledPosts(posts);
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;

    const scheduled = scheduleTime ? new Date(scheduleTime).toISOString() : undefined;

    if (selectedPlatform === "twitter") {
      await postToTwitter(postContent, undefined, scheduled);
    } else if (selectedPlatform === "discord" && discordWebhook) {
      await postToDiscord(discordWebhook, postContent, undefined, scheduled);
    }

    setPostContent("");
    setScheduleTime("");
    loadScheduledPosts();
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
        title="Growth Dashboard"
        description="Track your audience growth and engagement"
        icon={TrendingUp}
        showBackButton={true}
        backPath="/dashboard"
      />

      <motion.div
        className="container mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Tabs defaultValue="analytics" className="space-y-6">
          <motion.div variants={itemVariants}>
            <TabsList className="liquid-glass-panel p-1">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">Analytics</TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-primary/20">Social Automation</TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-primary/20">Scheduled Posts</TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="analytics" className="space-y-6">
            <ProFeatureGate 
              feature="Advanced Analytics Dashboard"
              description="Get detailed insights into your streaming performance, growth trends, and audience analytics."
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: "Total Viewers", value: growthData.reduce((sum, item) => sum + item.viewers, 0).toLocaleString(), icon: Eye, change: "+12%" },
                  { title: "Chat Messages", value: growthData.reduce((sum, item) => sum + item.messages, 0).toLocaleString(), icon: MessageCircle, change: "+8%" },
                  { title: "Avg Engagement", value: `${(growthData.reduce((sum, item) => sum + item.engagement, 0) / growthData.length || 0).toFixed(1)}%`, icon: Users, change: "+5%" },
                  { title: "Social Reach", value: "2.4K", icon: Share2, change: "+18%" },
                ].map((stat, index) => (
                  <motion.div key={stat.title} variants={itemVariants} transition={{ delay: index * 0.1 }}>
                    <LiquidGlassCard className="p-0">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <TrendingUp className="inline h-3 w-3 mr-1 text-success" />
                          {stat.change} from last month
                        </p>
                      </CardContent>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <LiquidGlassCard>
                    <CardHeader>
                      <CardTitle>Growth Trend</CardTitle>
                      <CardDescription>Viewers and engagement over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '12px',
                              backdropFilter: 'blur(20px)',
                            }} 
                          />
                          <Legend />
                          <Line type="monotone" dataKey="viewers" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                          <Line type="monotone" dataKey="engagement" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </LiquidGlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <LiquidGlassCard>
                    <CardHeader>
                      <CardTitle>Platform Distribution</CardTitle>
                      <CardDescription>Viewers by platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={100}
                            fill="hsl(var(--primary))"
                            dataKey="value"
                          >
                            {platformData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </LiquidGlassCard>
                </motion.div>
              </div>
            </ProFeatureGate>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <ProFeatureGate 
              feature="Social Media Automation"
              description="Automatically post stream highlights and updates to Twitter, Discord, and more."
            >
              <motion.div variants={itemVariants}>
                <LiquidGlassCard>
                  <CardHeader>
                    <CardTitle>Post to Social Media</CardTitle>
                    <CardDescription>Share updates across your platforms</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Platform</label>
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="liquid-glass-button">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="discord">Discord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPlatform === "discord" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Discord Webhook URL</label>
                        <Input
                          placeholder="https://discord.com/api/webhooks/..."
                          value={discordWebhook}
                          onChange={(e) => setDiscordWebhook(e.target.value)}
                          className="liquid-glass-button"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        placeholder="What's happening?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        rows={4}
                        className="liquid-glass-button"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Schedule (Optional)</label>
                      <Input
                        type="datetime-local"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="liquid-glass-button"
                      />
                    </div>

                    <Button 
                      onClick={handlePost} 
                      disabled={posting || !postContent.trim()}
                      className="w-full btn-glow"
                    >
                      {scheduleTime ? <Calendar className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
                      {posting ? "Posting..." : scheduleTime ? "Schedule Post" : "Post Now"}
                    </Button>
                  </CardContent>
                </LiquidGlassCard>
              </motion.div>
            </ProFeatureGate>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <motion.div variants={itemVariants}>
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle>Scheduled Posts</CardTitle>
                  <CardDescription>Manage your upcoming social media posts</CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduledPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 rounded-full bg-primary/10 inline-flex mb-4">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No scheduled posts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scheduledPosts.map((post, index) => (
                        <motion.div 
                          key={post.id} 
                          className="liquid-glass-panel p-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium px-2 py-1 rounded-full liquid-glass-badge">
                                  {post.platform}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.scheduled_time).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{post.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Growth;
