import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle } from "@capacitor/haptics";
import { 
  LiquidGlassCard, 
  LiquidGlassButton, 
  LiquidGlassBadge 
} from "@/components/ui/liquid-glass-card";
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Compass,
  Target,
  Radio,
  RefreshCw,
  Map,
  Locate,
  Eye
} from "lucide-react";

interface LocationHistory {
  lat: number;
  lon: number;
  timestamp: Date;
  name?: string;
}

export default function GeolocationFeatures() {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const geo = useGeolocation();
  
  const [locationName, setLocationName] = useState<string>("");
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [streamTags, setStreamTags] = useState<string[]>([]);

  useEffect(() => {
    geo.checkPermissions();
  }, []);

  useEffect(() => {
    if (geo.position) {
      fetchLocationName();
      generateStreamTags();
    }
  }, [geo.position]);

  const fetchLocationName = async () => {
    if (!geo.position) return;
    const name = await geo.getLocationName(
      geo.position.coords.latitude,
      geo.position.coords.longitude
    );
    setLocationName(name);
  };

  const generateStreamTags = () => {
    if (!geo.position) return;
    const tags = ["IRL", "Outdoor", "Location"];
    const hour = new Date().getHours();
    if (hour < 12) tags.push("Morning Stream");
    else if (hour < 18) tags.push("Afternoon Stream");
    else tags.push("Night Stream");
    setStreamTags(tags);
  };

  const handleGetLocation = async () => {
    await haptics.impact(ImpactStyle.Medium);
    const position = await geo.getCurrentPosition(true);
    if (position) {
      setLocationHistory(prev => [
        {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleStartTracking = async () => {
    await haptics.impact(ImpactStyle.Heavy);
    await geo.startWatching((position) => {
      setLocationHistory(prev => [
        {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    }, true);
  };

  const handleStopTracking = async () => {
    await haptics.impact(ImpactStyle.Light);
    await geo.stopWatching();
  };

  const handleRequestPermission = async () => {
    await haptics.impact(ImpactStyle.Medium);
    await geo.requestPermissions();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen liquid-glass-mesh p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/native")}
            className="liquid-glass-button !p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Geolocation</h1>
            <p className="text-white/60 text-sm">Location-based streaming features</p>
          </div>
        </div>

        {/* Permission Status */}
        {geo.permissionStatus && geo.permissionStatus.location !== 'granted' && (
          <LiquidGlassCard variant="glow-accent" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6 text-amber-400" />
                <div>
                  <p className="text-white font-medium">Location Permission Required</p>
                  <p className="text-white/60 text-sm">Enable to use location features</p>
                </div>
              </div>
              <LiquidGlassButton variant="primary" onClick={handleRequestPermission}>
                Enable
              </LiquidGlassButton>
            </div>
          </LiquidGlassCard>
        )}

        {/* Current Location */}
        <LiquidGlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="liquid-glass-icon w-12 h-12 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Current Location</h2>
              <p className="text-white/60 text-sm">
                {geo.isLoading ? "Getting location..." : locationName || "Tap to get location"}
              </p>
            </div>
          </div>

          {geo.position && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="liquid-glass-panel p-3 rounded-xl">
                <p className="text-white/60 text-xs uppercase">Latitude</p>
                <p className="text-white font-mono text-lg">
                  {geo.position.coords.latitude.toFixed(6)}°
                </p>
              </div>
              <div className="liquid-glass-panel p-3 rounded-xl">
                <p className="text-white/60 text-xs uppercase">Longitude</p>
                <p className="text-white font-mono text-lg">
                  {geo.position.coords.longitude.toFixed(6)}°
                </p>
              </div>
              <div className="liquid-glass-panel p-3 rounded-xl">
                <p className="text-white/60 text-xs uppercase">Accuracy</p>
                <p className="text-white font-mono text-lg">
                  ±{Math.round(geo.position.coords.accuracy)}m
                </p>
              </div>
              <div className="liquid-glass-panel p-3 rounded-xl">
                <p className="text-white/60 text-xs uppercase">Altitude</p>
                <p className="text-white font-mono text-lg">
                  {geo.position.coords.altitude 
                    ? `${Math.round(geo.position.coords.altitude)}m` 
                    : 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <LiquidGlassButton 
              variant="primary" 
              onClick={handleGetLocation}
              disabled={geo.isLoading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Locate className="w-4 h-4" />
              {geo.isLoading ? "Locating..." : "Get Location"}
            </LiquidGlassButton>
          </div>
        </LiquidGlassCard>

        {/* Live Tracking */}
        <LiquidGlassCard variant="panel" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`liquid-glass-icon w-10 h-10 flex items-center justify-center ${
                geo.isWatching ? 'animate-pulse' : ''
              }`}>
                <Navigation className={`w-5 h-5 ${geo.isWatching ? 'text-green-400' : 'text-blue-400'}`} />
              </div>
              <div>
                <h3 className="text-white font-medium">Live Tracking</h3>
                <p className="text-white/60 text-sm">
                  {geo.isWatching ? "Tracking active" : "Continuous location updates"}
                </p>
              </div>
            </div>
            <LiquidGlassBadge className={geo.isWatching ? "bg-green-500/20 text-green-400" : ""}>
              {geo.isWatching ? "Active" : "Inactive"}
            </LiquidGlassBadge>
          </div>

          <div className="flex gap-3">
            {!geo.isWatching ? (
              <LiquidGlassButton 
                variant="accent" 
                onClick={handleStartTracking}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                Start Tracking
              </LiquidGlassButton>
            ) : (
              <LiquidGlassButton 
                variant="default" 
                onClick={handleStopTracking}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Stop Tracking
              </LiquidGlassButton>
            )}
          </div>
        </LiquidGlassCard>

        {/* Stream Tags */}
        {streamTags.length > 0 && (
          <LiquidGlassCard variant="glow-primary" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium">Suggested Stream Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {streamTags.map((tag, index) => (
                <LiquidGlassBadge key={index} className="bg-purple-500/20 text-purple-300">
                  #{tag.replace(/\s/g, '')}
                </LiquidGlassBadge>
              ))}
            </div>
          </LiquidGlassCard>
        )}

        {/* Location History */}
        {locationHistory.length > 0 && (
          <LiquidGlassCard variant="panel" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Map className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-medium">Location History</h3>
              <LiquidGlassBadge>{locationHistory.length}</LiquidGlassBadge>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {locationHistory.map((loc, index) => (
                <div 
                  key={index} 
                  className="liquid-glass-panel p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-white/60" />
                    <div>
                      <p className="text-white text-sm font-mono">
                        {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
                      </p>
                      <p className="text-white/40 text-xs">
                        {loc.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        )}

        {/* Error Display */}
        {geo.error && (
          <LiquidGlassCard className="p-4 border-red-500/30">
            <p className="text-red-400 text-sm">{geo.error}</p>
          </LiquidGlassCard>
        )}
      </div>
    </motion.div>
  );
}
