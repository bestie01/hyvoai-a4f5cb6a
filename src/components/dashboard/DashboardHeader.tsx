import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search, Bell, Settings, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-white/10 liquid-glass-nav flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl liquid-glass-icon flex items-center justify-center bg-gradient-primary">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">Hyvo.ai Studio</span>
        </div>
        
        <Button
          className="bg-gradient-to-r from-accent to-accent/80 hover:opacity-90 text-black font-medium px-5 py-2 rounded-full shadow-glow-accent transition-all duration-300"
          onClick={() => navigate('/studio')}
          data-tour="stream-button"
        >
          <Play className="w-4 h-4 mr-2" />
          Go Live
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => navigate('/settings')} data-tour="settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
