import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Eye, Clock, MessageSquare,
  Download, Calendar, ArrowUpRight, ArrowDownRight, BarChart3, Activity
} from 'lucide-react';

// Mock data for demo
const viewerData = [
  { time: '00:00', viewers: 120, peak: 150 },
  { time: '02:00', viewers: 80, peak: 100 },
  { time: '04:00', viewers: 60, peak: 75 },
  { time: '06:00', viewers: 90, peak: 110 },
  { time: '08:00', viewers: 200, peak: 250 },
  { time: '10:00', viewers: 350, peak: 400 },
  { time: '12:00', viewers: 500, peak: 600 },
  { time: '14:00', viewers: 650, peak: 750 },
  { time: '16:00', viewers: 800, peak: 950 },
  { time: '18:00', viewers: 1200, peak: 1500 },
  { time: '20:00', viewers: 1800, peak: 2200 },
  { time: '22:00', viewers: 1500, peak: 1800 },
];

const engagementData = [
  { name: 'Mon', messages: 1200, reactions: 450, follows: 80 },
  { name: 'Tue', messages: 1500, reactions: 520, follows: 95 },
  { name: 'Wed', messages: 1100, reactions: 380, follows: 65 },
  { name: 'Thu', messages: 1800, reactions: 620, follows: 120 },
  { name: 'Fri', messages: 2200, reactions: 780, follows: 150 },
  { name: 'Sat', messages: 2800, reactions: 950, follows: 200 },
  { name: 'Sun', messages: 2400, reactions: 850, follows: 175 },
];

const platformData = [
  { name: 'Twitch', value: 65, color: 'hsl(var(--primary))' },
  { name: 'YouTube', value: 25, color: 'hsl(var(--destructive))' },
  { name: 'Kick', value: 10, color: 'hsl(var(--accent))' },
];

const compareData = [
  { week: 'Week 1', thisWeek: 1200, lastWeek: 900 },
  { week: 'Week 2', thisWeek: 1500, lastWeek: 1100 },
  { week: 'Week 3', thisWeek: 1800, lastWeek: 1400 },
  { week: 'Week 4', thisWeek: 2200, lastWeek: 1700 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down';
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-card border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(change)}% vs last period</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function EnhancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const { metrics, loading } = useRealtimeAnalytics();

  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Streams', metrics?.totalStreams || 0],
      ['Total Viewers', metrics?.totalViewers || 0],
      ['Peak Viewers', metrics?.peakViewers || 0],
      ['Avg Engagement', `${metrics?.avgEngagement?.toFixed(1) || 0}%`],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hyvo-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stream Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into your streaming performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Viewers" 
          value={loading ? '...' : metrics?.totalViewers?.toLocaleString() || '0'}
          change={12.5} 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Peak Concurrent" 
          value={loading ? '...' : metrics?.peakViewers?.toLocaleString() || '0'}
          change={8.2} 
          icon={Eye} 
          trend="up" 
        />
        <StatCard 
          title="Avg Watch Time" 
          value="42m" 
          change={-3.1} 
          icon={Clock} 
          trend="down" 
        />
        <StatCard 
          title="Chat Messages" 
          value={loading ? '...' : metrics?.totalMessages?.toLocaleString() || '0'}
          change={24.7} 
          icon={MessageSquare} 
          trend="up" 
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="viewers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="viewers">Viewer Trends</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="compare">Week Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="viewers">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Viewer Count Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewerData}>
                    <defs>
                      <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="viewers" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#viewerGradient)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="peak" 
                      stroke="hsl(var(--accent))" 
                      fill="url(#peakGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Weekly Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="messages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reactions" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="follows" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Viewer Distribution by Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Week-over-Week Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="thisWeek" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name="This Week"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lastWeek" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--muted-foreground))' }}
                      name="Last Week"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
