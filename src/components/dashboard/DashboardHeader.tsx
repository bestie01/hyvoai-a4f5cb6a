import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search, Bell, Settings, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Search Opening",
      description: "Global search is now active...",
    });
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "You have 3 new notifications",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Opening dashboard settings...",
    });
  };

  const handleNavigation = (direction) => {
    toast({
      title: direction === 'back' ? "Going Back" : "Going Forward",
      description: `Navigating ${direction}...`,
    });
  };

  return (
    <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => handleNavigation('back')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => handleNavigation('forward')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="text-white font-semibold">DialInsorUp</span>
        </div>
        
        <Button 
          className="bg-accent hover:bg-accent/80 text-black font-medium px-4 py-2 rounded-full"
          onClick={() => navigate('/studio')}
          data-tour="stream-button"
        >
          <Play className="w-4 h-4 mr-2" />
          Go Live
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-white text-sm font-medium">Live</span>
          <span className="text-white/60 text-sm">1.2k viewers</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={handleNotifications}
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/settings')}
            data-tour="settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}