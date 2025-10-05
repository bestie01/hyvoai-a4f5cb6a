import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Users, MessageCircle, Eye, Share2, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover-scale">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-display font-bold text-gradient-primary">Growth Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your audience growth and engagement</p>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="social">Social Automation</TabsTrigger>
            <TabsTrigger value="schedule">Scheduled Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {growthData.reduce((sum, item) => sum + item.viewers, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {growthData.reduce((sum, item) => sum + item.messages, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(growthData.reduce((sum, item) => sum + item.engagement, 0) / growthData.length || 0).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Social Reach</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4K</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +18% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-elevated">
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
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="viewers" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="engagement" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="card-elevated">
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
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Post to Social Media</CardTitle>
                <CardDescription>Share updates across your platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
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
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
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
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Scheduled Posts</CardTitle>
                <CardDescription>Manage your upcoming social media posts</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledPosts.map((post) => (
                      <div key={post.id} className="glass p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium px-2 py-1 rounded-full glass">
                                {post.platform}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.scheduled_time).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{post.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Growth;