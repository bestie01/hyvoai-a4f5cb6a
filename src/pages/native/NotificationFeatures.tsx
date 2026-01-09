import { useState } from "react";
import { ArrowLeft, Bell, BellRing, BellOff, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard, LiquidGlassIcon, LiquidGlassButton, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle } from "@capacitor/haptics";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  type: "sent" | "scheduled";
}

const NotificationFeatures = () => {
  const navigate = useNavigate();
  const notifications = usePushNotifications();
  const haptics = useHaptics();
  const [title, setTitle] = useState("Stream Alert!");
  const [body, setBody] = useState("Your stream is performing great! 🎉");
  const [scheduleDelay, setScheduleDelay] = useState(5);
  const [notificationLog, setNotificationLog] = useState<NotificationLog[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleSetupNotifications = async () => {
    await haptics.impact(ImpactStyle.Medium);
    await notifications.register();
  };

  const handleSendNotification = async () => {
    await haptics.impact(ImpactStyle.Light);
    await notifications.sendLocalNotification(title, body);
    
    setNotificationLog(prev => [{
      id: Date.now().toString(),
      title,
      body,
      timestamp: new Date(),
      type: "sent",
    }, ...prev]);
  };

  const handleScheduleNotification = async () => {
    await haptics.impact(ImpactStyle.Light);
    // Simulate scheduled notification
    const scheduledTime = new Date(Date.now() + scheduleDelay * 1000);
    
    setNotificationLog(prev => [{
      id: Date.now().toString(),
      title,
      body,
      timestamp: scheduledTime,
      type: "scheduled",
    }, ...prev]);

    // Actually send after delay
    setTimeout(async () => {
      await notifications.sendLocalNotification(title, body);
    }, scheduleDelay * 1000);
  };

  const clearLog = () => {
    haptics.impact(ImpactStyle.Medium);
    setNotificationLog([]);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

        {/* Header */}
        <header className="liquid-glass-nav relative z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/native-features")}
                className="liquid-glass-button !p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gradient-primary">Push Notifications</h1>
                <p className="text-sm text-muted-foreground">Alerts & scheduled messages</p>
              </div>
              <LiquidGlassBadge 
                className={`${notifications.isRegistered 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500'
                } text-white !border-0`}
              >
                {notifications.isRegistered ? "Active" : "Inactive"}
              </LiquidGlassBadge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
          {/* Permission Status */}
          <LiquidGlassCard variant="elevated" className="p-6">
            <div className="flex items-center gap-4">
              <LiquidGlassIcon 
                size="lg" 
                className={`bg-gradient-to-br ${notifications.isRegistered 
                  ? 'from-green-500 to-emerald-500' 
                  : 'from-orange-500 to-amber-500'
                } !border-0`}
              >
                {notifications.isRegistered ? (
                  <BellRing className="w-7 h-7 text-white" />
                ) : (
                  <BellOff className="w-7 h-7 text-white" />
                )}
              </LiquidGlassIcon>

              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {notifications.isRegistered ? "Notifications Enabled" : "Notifications Disabled"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {notifications.isRegistered 
                    ? "You'll receive alerts about your streams" 
                    : "Enable notifications to stay updated"
                  }
                </p>
              </div>

              {!notifications.isRegistered && (
                <LiquidGlassButton
                  variant="primary"
                  onClick={handleSetupNotifications}
                  className="flex items-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Enable
                </LiquidGlassButton>
              )}
            </div>
          </LiquidGlassCard>

          {/* Compose Notification */}
          <LiquidGlassCard variant="default" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Compose Notification
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                  className="liquid-glass-button !rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Notification message"
                  className="liquid-glass-button !rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <LiquidGlassButton
                  variant="primary"
                  onClick={handleSendNotification}
                  disabled={!notifications.isRegistered}
                  className="flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Now
                </LiquidGlassButton>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={scheduleDelay}
                    onChange={(e) => setScheduleDelay(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-20 liquid-glass-button !rounded-xl text-center"
                  />
                  <LiquidGlassButton
                    onClick={handleScheduleNotification}
                    disabled={!notifications.isRegistered}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Schedule ({scheduleDelay}s)
                  </LiquidGlassButton>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Settings */}
          <LiquidGlassCard variant="default" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound</Label>
                  <p className="text-sm text-muted-foreground">Play sound with notifications</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vibration</Label>
                  <p className="text-sm text-muted-foreground">Vibrate with notifications</p>
                </div>
                <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
              </div>
            </div>
          </LiquidGlassCard>

          {/* Notification Log */}
          <LiquidGlassCard variant="panel" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Notification History
              </h2>
              {notificationLog.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearLog}>
                  Clear
                </Button>
              )}
            </div>

            {notificationLog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications sent yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {notificationLog.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <LiquidGlassCard className="p-4" hoverEffect={false}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${log.type === 'sent' ? 'text-green-500' : 'text-amber-500'}`}>
                            {log.type === 'sent' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{log.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{log.body}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {log.type === 'sent' ? 'Sent' : 'Scheduled for'}{' '}
                              {log.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          <LiquidGlassBadge className="text-xs">
                            {log.type}
                          </LiquidGlassBadge>
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </LiquidGlassCard>
        </main>
      </div>
    </PageTransition>
  );
};

export default NotificationFeatures;
