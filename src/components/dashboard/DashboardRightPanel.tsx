import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, User, Palette, Code, Zap, Globe, Shield, Coffee, Star } from "lucide-react";

const designers = [
  { name: "Alex Johnson", role: "UI Designer", avatar: "A", online: true },
  { name: "Sarah Chen", role: "UX Designer", avatar: "S", online: false },
  { name: "Mike Davis", role: "Frontend Dev", avatar: "M", online: true },
  { name: "Emma Wilson", role: "Designer", avatar: "E", online: true },
  { name: "David Kim", role: "Backend Dev", avatar: "D", online: false },
  { name: "Lisa Brown", role: "Product Manager", avatar: "L", online: true },
  { name: "Tom Garcia", role: "DevOps", avatar: "T", online: false },
  { name: "Anna Martinez", role: "QA Engineer", avatar: "A", online: true },
];

const skills = [
  { icon: Palette, name: "Design", level: 95 },
  { icon: Code, name: "Development", level: 88 },
  { icon: Zap, name: "Performance", level: 92 },
  { icon: Globe, name: "SEO", level: 85 },
  { icon: Shield, name: "Security", level: 90 },
  { icon: Coffee, name: "Productivity", level: 96 },
];

export function DashboardRightPanel() {
  return (
    <div className="p-6 space-y-6">
      <Card className="p-4 bg-gradient-card border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Designers</h3>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {designers.map((designer, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{designer.avatar}</span>
                  </div>
                  {designer.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{designer.name}</p>
                  <p className="text-white/60 text-xs">{designer.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                <User className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <Button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20">
          View All Designers
        </Button>
      </Card>

      <Card className="p-4 bg-gradient-card border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Skills</h3>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            <Star className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
        
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <skill.icon className="w-4 h-4 text-accent" />
                  <span className="text-white text-sm font-medium">{skill.name}</span>
                </div>
                <span className="text-white/60 text-sm">{skill.level}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <Button className="w-full mt-4 bg-gradient-primary hover:opacity-80 text-white">
          Upgrade Skills
        </Button>
      </Card>

      <Card className="p-4 bg-gradient-card border border-white/10 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Export
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Share
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Settings
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Help
          </Button>
        </div>
      </Card>
    </div>
  );
}