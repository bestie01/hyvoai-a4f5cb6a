import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { PageTransition } from "@/components/animations/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAITitleGenerator } from "@/hooks/useAITitleGenerator";
import { useAIThumbnailGenerator } from "@/hooks/useAIThumbnailGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { 
  Sparkles, 
  Image, 
  Type, 
  Wand2, 
  Copy, 
  Check, 
  Download, 
  Zap,
  Loader2,
  ArrowRight,
  RefreshCw
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const StreamCreator = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  
  // Show loading while checking auth
  if (authLoading || subLoading) {
    return <LoadingScreen message="Loading Creator Tools..." />;
  }

  // Redirect non-authenticated users
  if (!user) {
    navigate("/auth", { state: { redirect: "/create" } });
    return null;
  }
  
  // Title generator
  const { generateTitles, result: titleResult, loading: titleLoading } = useAITitleGenerator();
  const [game, setGame] = useState("");
  const [theme, setTheme] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  
  // Thumbnail generator
  const { generateThumbnails, thumbnails, loading: thumbnailLoading } = useAIThumbnailGenerator();
  const [thumbnailTitle, setThumbnailTitle] = useState("");
  const [thumbnailGame, setThumbnailGame] = useState("");
  const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(null);
  
  // Show Pro gate for non-Pro users
  if (!authLoading && !subLoading && user && !isPro) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-hero">
          <Navigation />
          <section className="pt-32 pb-16 px-6">
            <div className="container mx-auto max-w-2xl">
              <ProFeatureGate 
                feature="AI Stream Creator" 
                description="Generate AI-powered titles and thumbnails for your streams. Upgrade to Pro to unlock this feature."
              />
            </div>
          </section>
        </div>
      </PageTransition>
    );
  }

  const handleGenerateTitles = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!game.trim()) {
      toast({
        title: "Game Required",
        description: "Please enter a game or category.",
        variant: "destructive",
      });
      return;
    }
    
    await generateTitles(game, theme, targetAudience);
  };

  const handleGenerateThumbnails = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use AI features.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!thumbnailTitle.trim() || !thumbnailGame.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both title and game.",
        variant: "destructive",
      });
      return;
    }
    
    await generateThumbnails(thumbnailTitle, thumbnailGame);
  };

  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    setCopiedTitle(title);
    toast({
      title: "Copied!",
      description: "Title copied to clipboard.",
    });
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  const handleDownloadThumbnail = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumbnail-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Download Started",
      description: "Your thumbnail is being downloaded.",
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        
        <section className="pt-32 pb-16 px-6 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 -z-10">
            <motion.div 
              className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            />
          </div>
          
          <motion.div 
            className="container mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-4 bg-gradient-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Stream Tools
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Create Your{" "}
                <span className="text-gradient-primary">
                  Perfect Stream
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Generate eye-catching titles and thumbnails with AI. Stand out from the crowd and grow your audience.
              </p>
            </motion.div>
          </motion.div>
        </section>

        <section className="pb-24 px-6">
          <motion.div 
            className="container mx-auto max-w-5xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Tabs defaultValue="titles" className="w-full">
              <motion.div variants={itemVariants}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="titles" className="text-lg py-3">
                    <Type className="w-5 h-5 mr-2" />
                    AI Titles
                  </TabsTrigger>
                  <TabsTrigger value="thumbnails" className="text-lg py-3">
                    <Image className="w-5 h-5 mr-2" />
                    AI Thumbnails
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              {/* Titles Tab */}
              <TabsContent value="titles">
                <motion.div 
                  className="grid lg:grid-cols-2 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wand2 className="w-5 h-5 text-primary" />
                          Generate Stream Titles
                        </CardTitle>
                        <CardDescription>
                          Enter your stream details for AI-optimized title suggestions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="game">Game / Category *</Label>
                          <Input
                            id="game"
                            placeholder="e.g., Valorant, Just Chatting, Minecraft"
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="theme">Stream Theme</Label>
                          <Input
                            id="theme"
                            placeholder="e.g., ranked grind, chill vibes, speedrun"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="audience">Target Audience</Label>
                          <Input
                            id="audience"
                            placeholder="e.g., competitive gamers, casual viewers"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                          />
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={handleGenerateTitles}
                            disabled={titleLoading}
                          >
                            {titleLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Titles
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="glass-card h-full">
                      <CardHeader>
                        <CardTitle>Generated Titles</CardTitle>
                        <CardDescription>
                          Click to copy any title to your clipboard
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {titleResult?.titles?.length ? (
                          titleResult.titles.map((title, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedTitle === title 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:border-primary/50 bg-card/50'
                              }`}
                              onClick={() => setSelectedTitle(title)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyTitle(title);
                                  }}
                                >
                                  {copiedTitle === title ? (
                                    <Check className="w-4 h-4 text-success" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Your AI-generated titles will appear here</p>
                          </div>
                        )}

                        {titleResult?.descriptions?.length > 0 && (
                          <div className="mt-6 pt-6 border-t">
                            <h4 className="font-semibold mb-3">Description Options</h4>
                            {titleResult.descriptions.map((desc, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="p-3 rounded-lg bg-muted/50 mb-2 text-sm cursor-pointer hover:bg-muted"
                                onClick={() => handleCopyTitle(desc)}
                              >
                                {desc}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              {/* Thumbnails Tab */}
              <TabsContent value="thumbnails">
                <motion.div 
                  className="space-y-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="w-5 h-5 text-primary" />
                          Generate Stream Thumbnails
                        </CardTitle>
                        <CardDescription>
                          Create eye-catching thumbnails with AI image generation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="thumbTitle">Stream Title *</Label>
                            <Input
                              id="thumbTitle"
                              placeholder="e.g., Road to Radiant"
                              value={thumbnailTitle}
                              onChange={(e) => setThumbnailTitle(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="thumbGame">Game *</Label>
                            <Input
                              id="thumbGame"
                              placeholder="e.g., Valorant, Fortnite"
                              value={thumbnailGame}
                              onChange={(e) => setThumbnailGame(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={handleGenerateThumbnails}
                            disabled={thumbnailLoading}
                          >
                            {thumbnailLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating Thumbnails...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Thumbnails
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Generated Thumbnails</CardTitle>
                        <CardDescription>
                          Click on a thumbnail to select, then download
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {thumbnails.length > 0 ? (
                          <div className="grid md:grid-cols-3 gap-6">
                            {thumbnails.map((thumb, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.15 }}
                                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                                  selectedThumbnail === index 
                                    ? 'border-primary shadow-glow-primary' 
                                    : 'border-transparent hover:border-primary/50'
                                }`}
                                onClick={() => setSelectedThumbnail(index)}
                              >
                                <div className="aspect-video bg-muted">
                                  <img 
                                    src={thumb.url} 
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadThumbnail(thumb.url, index);
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                                
                                <Badge 
                                  variant="secondary" 
                                  className="absolute top-2 left-2 capitalize"
                                >
                                  {thumb.style}
                                </Badge>
                                
                                {selectedThumbnail === index && (
                                  <div className="absolute top-2 right-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      <Check className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16 text-muted-foreground">
                            <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">Your AI-generated thumbnails will appear here</p>
                            <p className="text-sm">Generate 3 unique thumbnail options for your stream</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <motion.div 
              className="mt-12 text-center"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="glass-card border-primary/20">
                <CardContent className="py-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Go Live?</h3>
                  <p className="text-muted-foreground mb-6">
                    Launch the streaming studio with your AI-generated content
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" onClick={() => navigate('/studio')}>
                        <Zap className="w-5 h-5 mr-2" />
                        Open Studio
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="outline" onClick={() => navigate('/download')}>
                        <Download className="w-5 h-5 mr-2" />
                        Download Desktop App
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
};

export default StreamCreator;
