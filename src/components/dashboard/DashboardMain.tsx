import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Heart, TrendingUp, Users, DollarSign } from "lucide-react";

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 500 },
  { name: 'May', value: 800 },
];

const pieData = [
  { name: 'Desktop', value: 60, color: '#8b5cf6' },
  { name: 'Mobile', value: 30, color: '#06b6d4' },
  { name: 'Tablet', value: 10, color: '#10b981' },
];

export function DashboardMain() {
  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <Card className="p-6 bg-gradient-card border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Analytics Overview</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Time Stats */}
        <Card className="p-6 bg-gradient-card border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Real Time</h3>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Revenue</p>
                <p className="text-white font-semibold">$12,840</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Active Users</p>
                <p className="text-white font-semibold">1,247</p>
              </div>
            </div>
            
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Device Stats */}
        <Card className="p-6 bg-gradient-card border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Device Usage</h3>
          </div>
          
          <div className="flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-white/60 text-sm">{item.name}</span>
                </div>
                <span className="text-white text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Growth Rate Card */}
      <Card className="p-4 bg-gradient-card border border-white/10 backdrop-blur-xl w-fit">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Growth Rate</h4>
            <p className="text-white/60">+24% this week</p>
          </div>
        </div>
      </Card>
    </div>
  );
}