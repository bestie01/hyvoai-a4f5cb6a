import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MessageSquare, Clock, Eye, Crown } from "lucide-react";
import { ProBadge } from "@/components/ProFeatureGate";

const mockViewerData = [
  { time: "00:00", viewers: 45, messages: 12 },
  { time: "00:30", viewers: 67, messages: 23 },
  { time: "01:00", viewers: 89, messages: 34 },
  { time: "01:30", viewers: 123, messages: 45 },
  { time: "02:00", viewers: 156, messages: 67 },
  { time: "02:30", viewers: 134, messages: 56 },
  { time: "03:00", viewers: 98, messages: 43 },
];

const mockDemographicsData = [
  { name: "18-24", value: 35, color: "#8b5cf6" },
  { name: "25-34", value: 40, color: "#a855f7" },
  { name: "35-44", value: 20, color: "#c084fc" },
  { name: "45+", value: 5, color: "#ddd6fe" },
];

const mockTopStreamingTimes = [
  { day: "Mon", avgViewers: 156, bestTime: "8 PM" },
  { day: "Tue", avgViewers: 143, bestTime: "7 PM" },
  { day: "Wed", avgViewers: 189, bestTime: "8 PM" },
  { day: "Thu", avgViewers: 167, bestTime: "9 PM" },
  { day: "Fri", avgViewers: 234, bestTime: "8 PM" },
  { day: "Sat", avgViewers: 289, bestTime: "7 PM" },
  { day: "Sun", avgViewers: 256, bestTime: "6 PM" },
];

export const ProStreamAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <ProBadge />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Viewers</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600">+23% vs last stream</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Watch Time</p>
                <p className="text-2xl font-bold">24:32</p>
                <p className="text-xs text-green-600">+8% vs last stream</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chat Messages</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-green-600">+15% engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stream Duration</p>
                <p className="text-2xl font-bold">3h 45m</p>
                <p className="text-xs text-muted-foreground">Your longest stream</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viewer Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Viewer & Chat Trends
          </CardTitle>
          <CardDescription>Real-time viewer count and chat activity during your stream</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockViewerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="right" dataKey="messages" fill="#8b5cf6" opacity={0.7} name="Chat Messages" />
              <Line yAxisId="left" type="monotone" dataKey="viewers" stroke="#3b82f6" strokeWidth={3} name="Viewers" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
            <CardDescription>Age distribution of your viewers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockDemographicsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockDemographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best Streaming Times */}
        <Card>
          <CardHeader>
            <CardTitle>Optimal Streaming Schedule</CardTitle>
            <CardDescription>Best times to stream based on your audience</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockTopStreamingTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'avgViewers' ? 'Avg Viewers' : name]}
                  labelFormatter={(label) => `${label} - Best time: ${mockTopStreamingTimes.find(d => d.day === label)?.bestTime}`}
                />
                <Bar dataKey="avgViewers" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};