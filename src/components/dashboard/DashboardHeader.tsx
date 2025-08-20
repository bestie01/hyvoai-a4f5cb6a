import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Bell, Settings } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="text-white font-semibold">DialInsorUp</span>
        </div>
        
        <Button className="bg-accent hover:bg-accent/80 text-black font-medium px-4 py-2 rounded-full">
          ChillEchos
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-white text-sm font-medium">Live</span>
          <span className="text-white/60 text-sm">1.2k viewers</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}