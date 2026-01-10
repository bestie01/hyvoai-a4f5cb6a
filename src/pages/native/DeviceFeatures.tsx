import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle } from "@capacitor/haptics";
import { 
  LiquidGlassCard, 
  LiquidGlassButton, 
  LiquidGlassBadge 
} from "@/components/ui/liquid-glass-card";
import { 
  ArrowLeft, 
  Smartphone, 
  Battery, 
  BatteryCharging,
  Wifi,
  Signal,
  Cpu,
  HardDrive,
  Globe,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  Radio
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DeviceFeatures() {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const device = useDeviceInfo();
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    await device.refreshAll();
    const id = await device.getId();
    setDeviceId(id);
  };

  const handleRefresh = async () => {
    await haptics.impact(ImpactStyle.Medium);
    await loadDeviceInfo();
  };

  const streamReadiness = device.isStreamReady();
  const batteryPercent = device.battery ? Math.round((device.battery.batteryLevel || 0) * 100) : 0;

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-400";
    if (level > 20) return "text-yellow-400";
    return "text-red-400";
  };

  const getBatteryProgressColor = (level: number) => {
    if (level > 50) return "bg-green-500";
    if (level > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen liquid-glass-mesh p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-white">Device Info</h1>
              <p className="text-white/60 text-sm">System status & stream readiness</p>
            </div>
          </div>
          <LiquidGlassButton onClick={handleRefresh} disabled={device.isLoading}>
            <RefreshCw className={`w-4 h-4 ${device.isLoading ? 'animate-spin' : ''}`} />
          </LiquidGlassButton>
        </div>

        {/* Stream Readiness */}
        <LiquidGlassCard 
          variant={streamReadiness.ready ? "glow-primary" : "glow-accent"} 
          className="p-6"
        >
          <div className="flex items-center gap-4">
            <div className={`liquid-glass-icon w-14 h-14 flex items-center justify-center ${
              streamReadiness.ready ? '' : 'animate-pulse'
            }`}>
              {streamReadiness.ready ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">
                {streamReadiness.ready ? "Ready to Stream!" : "Check Before Streaming"}
              </h2>
              {streamReadiness.issues.length > 0 ? (
                <ul className="text-amber-300 text-sm mt-1">
                  {streamReadiness.issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-300 text-sm">All systems operational</p>
              )}
            </div>
            <LiquidGlassBadge className={streamReadiness.ready ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>
              {streamReadiness.ready ? "Good" : "Warning"}
            </LiquidGlassBadge>
          </div>
        </LiquidGlassCard>

        {/* Battery Status */}
        <LiquidGlassCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="liquid-glass-icon w-12 h-12 flex items-center justify-center">
              {device.battery?.isCharging ? (
                <BatteryCharging className="w-6 h-6 text-green-400 animate-pulse" />
              ) : (
                <Battery className={`w-6 h-6 ${getBatteryColor(batteryPercent)}`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">Battery</h3>
                <span className={`text-2xl font-bold ${getBatteryColor(batteryPercent)}`}>
                  {batteryPercent}%
                </span>
              </div>
              <p className="text-white/60 text-sm">
                {device.battery?.isCharging ? "Charging..." : "On battery power"}
              </p>
            </div>
          </div>
          
          <div className="relative h-4 rounded-full overflow-hidden bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${batteryPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${getBatteryProgressColor(batteryPercent)}`}
            />
            {device.battery?.isCharging && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </LiquidGlassCard>

        {/* Device Overview */}
        <LiquidGlassCard variant="panel" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-medium">Device Overview</h3>
            <LiquidGlassBadge>{device.getPlatformIcon()}</LiquidGlassBadge>
          </div>

          {device.info ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="liquid-glass-panel p-4 rounded-xl">
                <p className="text-white/60 text-xs uppercase mb-1">Platform</p>
                <p className="text-white font-medium capitalize">{device.info.platform}</p>
              </div>
              <div className="liquid-glass-panel p-4 rounded-xl">
                <p className="text-white/60 text-xs uppercase mb-1">Model</p>
                <p className="text-white font-medium">{device.info.model || 'Unknown'}</p>
              </div>
              <div className="liquid-glass-panel p-4 rounded-xl">
                <p className="text-white/60 text-xs uppercase mb-1">OS Version</p>
                <p className="text-white font-medium">{device.info.osVersion || 'Unknown'}</p>
              </div>
              <div className="liquid-glass-panel p-4 rounded-xl">
                <p className="text-white/60 text-xs uppercase mb-1">Manufacturer</p>
                <p className="text-white font-medium">{device.info.manufacturer || 'Unknown'}</p>
              </div>
              <div className="liquid-glass-panel p-4 rounded-xl col-span-2">
                <p className="text-white/60 text-xs uppercase mb-1">Web View Version</p>
                <p className="text-white font-medium text-sm truncate">
                  {device.info.webViewVersion || 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              {device.isLoading ? "Loading device info..." : "Tap refresh to load device info"}
            </div>
          )}
        </LiquidGlassCard>

        {/* System Stats */}
        <div className="grid grid-cols-2 gap-4">
          <LiquidGlassCard variant="panel" className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Language</span>
            </div>
            <p className="text-2xl font-bold text-white uppercase">
              {device.languageCode || '—'}
            </p>
          </LiquidGlassCard>

          <LiquidGlassCard variant="panel" className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">Virtual</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {device.info?.isVirtual ? 'Yes' : 'No'}
            </p>
          </LiquidGlassCard>
        </div>

        {/* Device ID */}
        {deviceId && (
          <LiquidGlassCard variant="panel" className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Device ID</span>
            </div>
            <p className="text-white/60 font-mono text-xs break-all">{deviceId}</p>
          </LiquidGlassCard>
        )}

        {/* Quick Actions */}
        <LiquidGlassCard variant="glow-primary" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-medium">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LiquidGlassButton 
              variant="primary"
              onClick={() => navigate('/studio')}
              className="flex items-center justify-center gap-2 py-3"
            >
              <Zap className="w-4 h-4" />
              Go Live
            </LiquidGlassButton>
            <LiquidGlassButton 
              variant="accent"
              onClick={() => navigate('/native/geolocation')}
              className="flex items-center justify-center gap-2 py-3"
            >
              <Signal className="w-4 h-4" />
              Location
            </LiquidGlassButton>
          </div>
        </LiquidGlassCard>

        {/* Error Display */}
        {device.error && (
          <LiquidGlassCard className="p-4 border-red-500/30">
            <p className="text-red-400 text-sm">{device.error}</p>
          </LiquidGlassCard>
        )}
      </div>
    </motion.div>
  );
}
