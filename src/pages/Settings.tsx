import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { User, Settings2, Bell, CreditCard, Crown, ExternalLink, Video, Key, Calendar, Eye, EyeOff, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import Footer from '@/components/Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, loading, updateSettings } = useSettings();
  const { subscription, isPro, loading: subLoading, openCustomerPortal } = useSubscription();
  const { currentVersion, latestVersion, hasUpdate, isDesktop, updateStatus, downloadProgress, checkForUpdates, installUpdate } = useVersionCheck();
  
  const [bitrate, setBitrate] = useState(2500);
  const [resolution, setResolution] = useState('1920x1080');
  const [fps, setFps] = useState(30);
  const [twitchKey, setTwitchKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [showTwitchKey, setShowTwitchKey] = useState(false);
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);

  useEffect(() => {
    if (settings) {
      setBitrate(settings.bitrate || 2500);
      setResolution(settings.resolution || '1920x1080');
      setFps(settings.fps || 30);
      setTwitchKey(settings.twitch_api_key || '');
      setYoutubeKey(settings.youtube_api_key || '');
      setEmailNotif(settings.notification_email ?? true);
      setPushNotif(settings.notification_push ?? true);
    }
  }, [settings]);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  const handleSaveStream = () => updateSettings({ bitrate, resolution, fps });
  const handleSaveAPI = () => updateSettings({ twitch_api_key: twitchKey, youtube_api_key: youtubeKey });
  const handleSaveNotifications = () => updateSettings({ notification_email: emailNotif, notification_push: pushNotif });

  if (loading) return <LoadingScreen message="Loading Settings..." />;

  const tabCount = 5; // stream, api, notifications, billing, updates

  return (
    <div className="min-h-screen liquid-glass-bg relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} />
      </div>

      <PageHeader title="Settings" description="Configure your streaming preferences" icon={Settings2} showBackButton={true} />
      
      <motion.main className="container mx-auto px-4 py-8 max-w-4xl" variants={containerVariants} initial="hidden" animate="visible">
        <Tabs defaultValue="stream" className="w-full space-y-6">
          <motion.div variants={itemVariants}>
            <TabsList className={`grid w-full grid-cols-${tabCount} liquid-glass-panel p-1`}>
              <TabsTrigger value="stream" className="gap-2 data-[state=active]:bg-primary/20">
                <Video className="w-4 h-4" /><span className="hidden sm:inline">Stream</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2 data-[state=active]:bg-primary/20">
                <Key className="w-4 h-4" /><span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary/20">
                <Bell className="w-4 h-4" /><span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-primary/20">
                <CreditCard className="w-4 h-4" /><span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="updates" className="gap-2 data-[state=active]:bg-primary/20 relative">
                <Download className="w-4 h-4" /><span className="hidden sm:inline">Updates</span>
                {hasUpdate && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />}
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Stream Tab */}
          <TabsContent value="stream" className="space-y-4">
            <motion.div variants={itemVariants}>
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Video className="w-5 h-5 text-primary" />Stream Quality Settings</CardTitle>
                  <CardDescription>Configure your default stream quality preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                    <Input id="bitrate" type="number" value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))} placeholder="2500" className="liquid-glass-button" />
                    <p className="text-xs text-muted-foreground">Recommended: 2500-6000 for 1080p</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger className="liquid-glass-button"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                        <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                        <SelectItem value="854x480">854x480 (SD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fps">Frame Rate</Label>
                    <Select value={fps.toString()} onValueChange={(v) => setFps(Number(v))}>
                      <SelectTrigger className="liquid-glass-button"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveStream} className="btn-glow">Save Stream Settings</Button>
                </CardContent>
              </LiquidGlassCard>
            </motion.div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-4">
            <motion.div variants={itemVariants}>
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-primary" />API Keys</CardTitle>
                  <CardDescription>Securely store your streaming platform API keys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="twitch">Twitch Stream Key</Label>
                    <div className="relative">
                      <Input id="twitch" type={showTwitchKey ? "text" : "password"} value={twitchKey} onChange={(e) => setTwitchKey(e.target.value)} placeholder="Enter your Twitch stream key" className="liquid-glass-button pr-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowTwitchKey(!showTwitchKey)}>
                        {showTwitchKey ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Find this in your Twitch Creator Dashboard → Settings → Stream</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube Stream Key</Label>
                    <div className="relative">
                      <Input id="youtube" type={showYoutubeKey ? "text" : "password"} value={youtubeKey} onChange={(e) => setYoutubeKey(e.target.value)} placeholder="Enter your YouTube stream key" className="liquid-glass-button pr-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowYoutubeKey(!showYoutubeKey)}>
                        {showYoutubeKey ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Find this in YouTube Studio → Go Live → Stream Settings</p>
                  </div>
                  <Button onClick={handleSaveAPI} className="btn-glow">Save API Keys</Button>
                </CardContent>
              </LiquidGlassCard>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <motion.div variants={itemVariants}>
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 liquid-glass-panel rounded-xl">
                    <div><Label htmlFor="email-notif" className="font-medium">Email Notifications</Label><p className="text-sm text-muted-foreground">Receive updates via email</p></div>
                    <Switch id="email-notif" checked={emailNotif} onCheckedChange={setEmailNotif} />
                  </div>
                  <div className="flex items-center justify-between p-4 liquid-glass-panel rounded-xl">
                    <div><Label htmlFor="push-notif" className="font-medium">Push Notifications</Label><p className="text-sm text-muted-foreground">Receive browser push notifications</p></div>
                    <Switch id="push-notif" checked={pushNotif} onCheckedChange={setPushNotif} />
                  </div>
                  <Button onClick={handleSaveNotifications} className="btn-glow">Save Notification Settings</Button>
                </CardContent>
              </LiquidGlassCard>
            </motion.div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <motion.div variants={itemVariants}>
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Billing & Subscription</CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-5 liquid-glass-panel rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 text-lg">
                          {isPro ? (<><Crown className="w-5 h-5 text-amber-500" />{subscription.subscription_tier} Plan</>) : "Free Plan"}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{isPro ? "You have access to all premium features" : "Upgrade to unlock all Pro features"}</p>
                      </div>
                      {isPro && <Badge variant="outline" className="border-success text-success">Active</Badge>}
                    </div>
                    {subscription.subscription_end && (
                      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" />Renews on {new Date(subscription.subscription_end).toLocaleDateString()}</p>
                    )}
                    <div className="flex gap-3">
                      {isPro ? (
                        <Button onClick={openCustomerPortal} disabled={subLoading} className="btn-glow"><ExternalLink className="w-4 h-4 mr-2" />{subLoading ? "Loading..." : "Manage Subscription"}</Button>
                      ) : (
                        <Button onClick={() => navigate('/pricing')} className="btn-glow"><Crown className="w-4 h-4 mr-2" />Upgrade to Pro</Button>
                      )}
                      <Button variant="outline" onClick={() => navigate('/profile')} className="liquid-glass-button"><User className="w-4 h-4 mr-2" />View Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </motion.div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            <motion.div variants={itemVariants}>
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-primary" />App Updates</CardTitle>
                  <CardDescription>{isDesktop ? "Updates are installed automatically" : "Download the latest version"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-5 liquid-glass-panel rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Current Version</p>
                        <p className="text-2xl font-bold text-primary">v{currentVersion}</p>
                      </div>
                      {latestVersion && (
                        <div className="text-right">
                          <p className="text-sm font-medium">Latest Version</p>
                          <p className="text-2xl font-bold">{hasUpdate ? <span className="text-accent">v{latestVersion}</span> : <span className="text-muted-foreground">v{latestVersion}</span>}</p>
                        </div>
                      )}
                    </div>

                    {!hasUpdate && updateStatus === 'idle' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        You're up to date!
                      </div>
                    )}

                    {updateStatus === 'downloading' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Downloading update...</span><span>{Math.round(downloadProgress)}%</span></div>
                        <Progress value={downloadProgress} className="h-2" />
                      </div>
                    )}

                    {updateStatus === 'ready' && (
                      <Button onClick={installUpdate} className="btn-glow w-full"><CheckCircle className="w-4 h-4 mr-2" />Restart to Install Update</Button>
                    )}

                    {(updateStatus === 'idle' || updateStatus === 'error') && (
                      <Button onClick={checkForUpdates} variant="outline" className="liquid-glass-button w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Check for Updates
                      </Button>
                    )}

                    {!isDesktop && hasUpdate && (
                      <Button onClick={() => navigate('/download')} className="btn-glow w-full"><Download className="w-4 h-4 mr-2" />Go to Downloads</Button>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{isDesktop ? "Desktop app updates are downloaded and installed automatically in the background." : "Download the desktop app for automatic updates."}</p>
                    <p>Release notes are available on the <a href="/changelog" className="text-primary hover:underline">Changelog</a> page.</p>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.main>

      <Footer />
    </div>
  );
};

export default Settings;
