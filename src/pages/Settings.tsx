import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [bitrate, setBitrate] = useState(settings?.bitrate || 2500);
  const [resolution, setResolution] = useState(settings?.resolution || '1920x1080');
  const [fps, setFps] = useState(settings?.fps || 30);
  const [twitchKey, setTwitchKey] = useState(settings?.twitch_api_key || '');
  const [youtubeKey, setYoutubeKey] = useState(settings?.youtube_api_key || '');
  const [emailNotif, setEmailNotif] = useState(settings?.notification_email ?? true);
  const [pushNotif, setPushNotif] = useState(settings?.notification_push ?? true);

  const handleSaveStream = () => {
    updateSettings({ bitrate, resolution, fps });
  };

  const handleSaveAPI = () => {
    updateSettings({ twitch_api_key: twitchKey, youtube_api_key: youtubeKey });
  };

  const handleSaveNotifications = () => {
    updateSettings({ notification_email: emailNotif, notification_push: pushNotif });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>
        
        <Tabs defaultValue="stream" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stream">Stream</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="stream">
            <Card>
              <CardHeader>
                <CardTitle>Stream Quality Settings</CardTitle>
                <CardDescription>Configure your default stream quality preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                  <Input
                    id="bitrate"
                    type="number"
                    value={bitrate}
                    onChange={(e) => setBitrate(Number(e.target.value))}
                    placeholder="2500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                      <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                      <SelectItem value="854x480">854x480 (SD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fps">FPS</Label>
                  <Select value={fps.toString()} onValueChange={(v) => setFps(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 FPS</SelectItem>
                      <SelectItem value="60">60 FPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveStream}>Save Stream Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Securely store your streaming platform API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="twitch">Twitch API Key</Label>
                  <Input
                    id="twitch"
                    type="password"
                    value={twitchKey}
                    onChange={(e) => setTwitchKey(e.target.value)}
                    placeholder="Enter your Twitch API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube API Key</Label>
                  <Input
                    id="youtube"
                    type="password"
                    value={youtubeKey}
                    onChange={(e) => setYoutubeKey(e.target.value)}
                    placeholder="Enter your YouTube API key"
                  />
                </div>

                <Button onClick={handleSaveAPI}>Save API Keys</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={emailNotif}
                    onCheckedChange={setEmailNotif}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notif">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={pushNotif}
                    onCheckedChange={setPushNotif}
                  />
                </div>

                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Visit the <a href="/pricing" className="text-primary hover:underline">Pricing page</a> to manage your subscription or upgrade your plan.
                </p>
                <Button asChild>
                  <a href="/pricing">Go to Pricing</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
