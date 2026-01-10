import { useState } from "react";
import { ArrowLeft, Camera, ImagePlus, Settings, Trash2, Download, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard, LiquidGlassIcon, LiquidGlassButton, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { useCamera } from "@/hooks/useCamera";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle } from "@capacitor/haptics";
import { CameraSource, CameraResultType } from "@capacitor/camera";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CameraFeatures = () => {
  const navigate = useNavigate();
  const camera = useCamera();
  const haptics = useHaptics();
  const [quality, setQuality] = useState([90]);
  const [resultType, setResultType] = useState<CameraResultType>(CameraResultType.Uri);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleCameraCapture = async () => {
    await haptics.impact(ImpactStyle.Light);
    const photo = await camera.takePicture(CameraSource.Camera);
    if (photo) {
      setCapturedPhotos(prev => [photo, ...prev]);
    }
  };

  const handleGalleryPick = async () => {
    await haptics.impact(ImpactStyle.Light);
    const photo = await camera.takePicture(CameraSource.Photos);
    if (photo) {
      setCapturedPhotos(prev => [photo, ...prev]);
    }
  };

  const handleDeletePhoto = (index: number) => {
    haptics.impact(ImpactStyle.Medium);
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
    if (selectedPhoto === capturedPhotos[index]) {
      setSelectedPhoto(null);
    }
  };

  const clearAllPhotos = () => {
    haptics.impact(ImpactStyle.Heavy);
    setCapturedPhotos([]);
    setSelectedPhoto(null);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        {/* Header */}
        <header className="liquid-glass-nav relative z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/native")}
                className="liquid-glass-button !p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gradient-primary">Camera & Gallery</h1>
                <p className="text-sm text-muted-foreground">Capture and manage photos</p>
              </div>
              <LiquidGlassBadge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white !border-0">
                {capturedPhotos.length} Photos
              </LiquidGlassBadge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
          {/* Capture Controls */}
          <LiquidGlassCard variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Capture Controls
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Main Buttons */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <LiquidGlassButton
                    variant="primary"
                    onClick={handleCameraCapture}
                    disabled={camera.isLoading}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </LiquidGlassButton>
                  <LiquidGlassButton
                    onClick={handleGalleryPick}
                    disabled={camera.isLoading}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <ImagePlus className="w-5 h-5" />
                    Gallery
                  </LiquidGlassButton>
                </div>
                
                {camera.isLoading && (
                  <div className="text-center text-sm text-muted-foreground animate-pulse">
                    Processing...
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Quality: {quality[0]}%
                  </Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={10}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Result Type</Label>
                  <Select value={resultType} onValueChange={(v) => setResultType(v as CameraResultType)}>
                    <SelectTrigger className="liquid-glass-button !rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CameraResultType.Uri}>URI (File Path)</SelectItem>
                      <SelectItem value={CameraResultType.Base64}>Base64</SelectItem>
                      <SelectItem value={CameraResultType.DataUrl}>Data URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Photo Preview */}
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <LiquidGlassCard variant="panel" className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPhoto(null)}
                  >
                    Close
                  </Button>
                </div>
                <img
                  src={selectedPhoto}
                  alt="Selected"
                  className="w-full max-h-[60vh] object-contain rounded-xl"
                />
              </LiquidGlassCard>
            </motion.div>
          )}

          {/* Photo Gallery */}
          <LiquidGlassCard variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-primary" />
                Captured Photos
              </h2>
              {capturedPhotos.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllPhotos}
                  className="text-destructive"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {capturedPhotos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No photos captured yet</p>
                <p className="text-sm">Use the buttons above to capture or pick photos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {capturedPhotos.map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <LiquidGlassCard className="p-2 !rounded-xl overflow-hidden" hoverEffect={false}>
                      <img
                        src={photo}
                        alt={`Captured ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      />
                      <div className="absolute inset-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-white hover:bg-white/20"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-white hover:bg-white/20"
                          onClick={() => handleDeletePhoto(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </LiquidGlassCard>
        </main>
      </div>
    </PageTransition>
  );
};

export default CameraFeatures;
