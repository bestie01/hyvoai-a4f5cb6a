import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useToast } from '@/hooks/use-toast';

export const useCamera = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const takePicture = async (source: CameraSource = CameraSource.Camera) => {
    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: source,
      });

      setPhoto(image.webPath || null);
      toast({
        title: "Photo captured",
        description: "Photo ready for streaming",
      });
      return image.webPath;
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera error",
        description: "Failed to access camera",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  return {
    photo,
    isLoading,
    takePicture,
    requestPermissions,
  };
};
