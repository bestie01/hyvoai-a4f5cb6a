import { useEffect, useState } from "react";
import { ArrowLeft, HardDrive, Download, Trash2, FileJson, FolderOpen, RefreshCw, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard, LiquidGlassIcon, LiquidGlassButton, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { useNativeFileSystem } from "@/hooks/useNativeFileSystem";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const StorageFeatures = () => {
  const navigate = useNavigate();
  const fileSystem = useNativeFileSystem();
  const haptics = useHaptics();
  const [highlights, setHighlights] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [storageUsed, setStorageUsed] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    setIsRefreshing(true);
    try {
      const files = await fileSystem.listHighlights();
      setHighlights(files);
      // Simulate storage calculation
      setStorageUsed(Math.min(files.length * 2.5, 100));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveHighlight = async () => {
    await haptics.notification(NotificationType.Success);
    const timestamp = new Date().toISOString();
    const data = {
      timestamp,
      type: "highlight",
      data: {
        viewers: Math.floor(Math.random() * 1000),
        duration: Math.floor(Math.random() * 300),
        title: `Highlight ${Date.now()}`,
      },
    };
    await fileSystem.saveHighlight(
      JSON.stringify(data, null, 2),
      `highlight-${Date.now()}.json`
    );
    await loadHighlights();
  };

  const handleDeleteHighlight = async (filename: string) => {
    await haptics.notification(NotificationType.Warning);
    await fileSystem.deleteHighlight(filename);
    await loadHighlights();
  };

  const handleRefresh = async () => {
    await haptics.impact(ImpactStyle.Light);
    await loadHighlights();
  };

  const filteredHighlights = highlights.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />

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
                <h1 className="text-2xl font-bold text-gradient-primary">Local Storage</h1>
                <p className="text-sm text-muted-foreground">Manage saved files & highlights</p>
              </div>
              <LiquidGlassBadge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white !border-0">
                {highlights.length} Files
              </LiquidGlassBadge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
          {/* Storage Stats */}
          <LiquidGlassCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-primary" />
                Storage Overview
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used Space</span>
                  <span className="font-medium">{storageUsed.toFixed(1)}%</span>
                </div>
                <Progress value={storageUsed} className="h-2" />
              </div>

              <LiquidGlassCard className="p-4 text-center" hoverEffect={false}>
                <div className="text-3xl font-bold text-primary">{highlights.length}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4 text-center" hoverEffect={false}>
                <div className="text-3xl font-bold text-accent">
                  {formatFileSize(highlights.length * 1024)}
                </div>
                <div className="text-sm text-muted-foreground">Est. Size</div>
              </LiquidGlassCard>
            </div>
          </LiquidGlassCard>

          {/* Actions */}
          <div className="flex gap-4 flex-wrap">
            <LiquidGlassButton
              variant="primary"
              onClick={handleSaveHighlight}
              disabled={fileSystem.isLoading}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Save New Highlight
            </LiquidGlassButton>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 liquid-glass-button !rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* File List */}
          <LiquidGlassCard variant="default" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Saved Highlights
            </h2>

            {filteredHighlights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileJson className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{searchQuery ? "No files match your search" : "No highlights saved yet"}</p>
                <p className="text-sm">Click "Save New Highlight" to create one</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredHighlights.map((file, index) => (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <LiquidGlassCard className="p-4" hoverEffect={false}>
                        <div className="flex items-center gap-4">
                          <LiquidGlassIcon size="sm" className="bg-gradient-to-br from-emerald-500 to-teal-500 !border-0">
                            <FileJson className="w-4 h-4 text-white" />
                          </LiquidGlassIcon>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.name}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatFileSize(file.size || 1024)}</span>
                              {file.mtime && (
                                <span>{format(new Date(file.mtime), 'MMM d, yyyy HH:mm')}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 text-muted-foreground hover:text-foreground"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteHighlight(file.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

export default StorageFeatures;
