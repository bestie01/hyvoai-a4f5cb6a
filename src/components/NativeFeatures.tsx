import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, Vibrate, HardDrive, Bell, Smartphone, 
  Download, Play, Trash2, ImagePlus 
} from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useHaptics } from '@/hooks/useHaptics';
import { useNativeFileSystem } from '@/hooks/useNativeFileSystem';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useStatusBar } from '@/hooks/useStatusBar';
import { useAppState } from '@/hooks/useAppState';
import { ImpactStyle, NotificationType } from '@capacitor/haptics';
import { CameraSource } from '@capacitor/camera';
import { Style } from '@capacitor/status-bar';

export const NativeFeatures = () => {
  const camera = useCamera();
  const haptics = useHaptics();
  const fileSystem = useNativeFileSystem();
  const notifications = usePushNotifications();
  const statusBar = useStatusBar();
  const appState = useAppState();
  const [highlights, setHighlights] = useState<any[]>([]);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    const files = await fileSystem.listHighlights();
    setHighlights(files);
  };

  const handleCameraCapture = async () => {
    await haptics.impact(ImpactStyle.Light);
    await camera.takePicture(CameraSource.Camera);
  };

  const handleGalleryPick = async () => {
    await haptics.impact(ImpactStyle.Light);
    await camera.takePicture(CameraSource.Photos);
  };

  const handleSaveHighlight = async () => {
    await haptics.notification(NotificationType.Success);
    const timestamp = new Date().toISOString();
    await fileSystem.saveHighlight(
      JSON.stringify({ timestamp, data: 'Sample highlight data' }),
      `highlight-${Date.now()}.json`
    );
    await loadHighlights();
  };

  const handleDeleteHighlight = async (filename: string) => {
    await haptics.notification(NotificationType.Warning);
    await fileSystem.deleteHighlight(filename);
    await loadHighlights();
  };

  const handleVibrate = async () => {
    await haptics.vibrate(300);
  };

  const handleNotificationSetup = async () => {
    await haptics.impact(ImpactStyle.Medium);
    await notifications.register();
  };

  const handleTestNotification = async () => {
    await notifications.sendLocalNotification(
      'Stream Alert!',
      'Your stream is performing great! 🎉'
    );
  };

  const handleStatusBarLight = async () => {
    await statusBar.setStyle(Style.Light);
    await statusBar.setBackgroundColor('#ffffff');
  };

  const handleStatusBarDark = async () => {
    await statusBar.setStyle(Style.Dark);
    await statusBar.setBackgroundColor('#1e293b');
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Native Features Dashboard
          </CardTitle>
          <CardDescription>
            Test and manage all native mobile capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App State */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              App State
            </h3>
            <div className="flex gap-2">
              <Badge variant={appState.isBackground ? "secondary" : "default"}>
                {appState.isBackground ? 'Background' : 'Active'}
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={appState.minimizeApp}
              >
                Minimize App
              </Button>
            </div>
          </div>

          {/* Camera */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera Access
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleCameraCapture}
                disabled={camera.isLoading}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGalleryPick}
                disabled={camera.isLoading}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Pick from Gallery
              </Button>
            </div>
            {camera.photo && (
              <img 
                src={camera.photo} 
                alt="Captured" 
                className="w-full max-w-xs rounded-lg border"
              />
            )}
          </div>

          {/* Haptics */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Vibrate className="w-4 h-4" />
              Haptic Feedback
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => haptics.impact(ImpactStyle.Light)}
              >
                Light
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => haptics.impact(ImpactStyle.Medium)}
              >
                Medium
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => haptics.impact(ImpactStyle.Heavy)}
              >
                Heavy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleVibrate}
              >
                <Vibrate className="w-4 h-4 mr-2" />
                Vibrate
              </Button>
            </div>
          </div>

          {/* File System */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Local Storage ({highlights.length} highlights)
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleSaveHighlight}
                disabled={fileSystem.isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Save Highlight
              </Button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {highlights.map((file: any) => (
                <div 
                  key={file.name} 
                  className="flex items-center justify-between p-2 bg-secondary/20 rounded text-xs"
                >
                  <span className="truncate flex-1">{file.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteHighlight(file.name)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Push Notifications
              {notifications.isRegistered && (
                <Badge variant="default" className="ml-2">Active</Badge>
              )}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleNotificationSetup}
                disabled={notifications.isRegistered}
              >
                Enable Notifications
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestNotification}
                disabled={!notifications.isRegistered}
              >
                <Play className="w-4 h-4 mr-2" />
                Test Notification
              </Button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Status Bar Customization
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleStatusBarLight}
              >
                Light Mode
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStatusBarDark}
              >
                Dark Mode
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusBar.hide()}
              >
                Hide
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusBar.show()}
              >
                Show
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
