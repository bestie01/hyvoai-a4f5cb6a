import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Monitor, Shield, Zap, Check, Globe, ExternalLink, Loader2, Github, Sparkles, Apple, Terminal, ChevronDown, Clock, FileDown, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";
import { BuildStatusCard } from "@/components/BuildStatusCard";
import { GITHUB_CONFIG } from "@/lib/constants";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

type DetectedOS = "windows" | "macos" | "linux" | "unknown";

function detectOS(): DetectedOS {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}

const DownloadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    latestVersion, 
    releaseUrl,
    releaseDate,
    releaseNotes,
    isLoading, 
    hasReleases, 
    getAssetUrl, 
    getAssetSize,
    getAssetDownloads,
  } = useGitHubReleases();

  const userOS = useMemo(() => detectOS(), []);

  const handleLaunchWebApp = () => {
    navigate('/studio');
  };

  const handleDownload = (platform: string, downloadUrl: string | null) => {
    if (!downloadUrl) {
      toast({
        title: "Download Not Available",
        description: `The ${platform} installer is not yet available. Use the Web App instead, or check GitHub Actions for build status.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Download Starting",
      description: `Downloading Hyvo Stream Studio for ${platform}...`,
    });

    window.open(downloadUrl, '_blank');
  };

  const platforms = [
    {
      name: "Windows",
      icon: Monitor,
      requirements: "Windows 10/11 (64-bit)",
      patterns: [".exe"],
      fileExt: ".exe",
      osKey: "windows" as DetectedOS,
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      name: "macOS (Intel)",
      icon: Apple,
      requirements: "macOS 11.0+ (Intel)",
      patterns: ["-x64.dmg", "x64.dmg", "-intel.dmg"],
      fileExt: ".dmg",
      osKey: "macos" as DetectedOS,
      color: "from-gray-500/20 to-zinc-500/20",
    },
    {
      name: "macOS (Apple Silicon)",
      icon: Apple,
      requirements: "macOS 11.0+ (M1/M2/M3)",
      patterns: ["-arm64.dmg", "arm64.dmg", "-universal.dmg"],
      fileExt: ".dmg",
      osKey: "macos" as DetectedOS,
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      name: "Linux (AppImage)",
      icon: Terminal,
      requirements: "Any Linux distro",
      patterns: [".AppImage"],
      fileExt: ".AppImage",
      osKey: "linux" as DetectedOS,
      color: "from-orange-500/20 to-amber-500/20",
    },
    {
      name: "Linux (Debian)",
      icon: Terminal,
      requirements: "Ubuntu/Debian",
      patterns: [".deb"],
      fileExt: ".deb",
      osKey: "linux" as DetectedOS,
      color: "from-red-500/20 to-rose-500/20",
    },
  ];

  // Sort platforms: user's OS first
  const sortedPlatforms = useMemo(() => {
    if (userOS === "unknown") return platforms;
    return [...platforms].sort((a, b) => {
      const aMatch = a.osKey === userOS ? 0 : 1;
      const bMatch = b.osKey === userOS ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [userOS]);

  const features = [
    "Real-time stream monitoring",
    "AI-powered highlight detection",
    "Multi-platform streaming support",
    "Advanced analytics dashboard",
    "Custom overlay creation",
    "Automated clip generation",
  ];

  const formattedDate = releaseDate ? format(new Date(releaseDate), "MMM d, yyyy") : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 relative overflow-hidden">
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
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div 
                  className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Download className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary">
                  Get Hyvo Stream Studio
                </h1>
              </div>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Start streaming instantly with our web app, or download the desktop version for advanced features.
              </p>

              {isLoading ? (
                <Badge variant="secondary" className="mb-8">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Checking for releases...
                </Badge>
              ) : hasReleases ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-2 mb-8"
                >
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-2 text-sm">
                    <Github className="w-4 h-4 mr-2" />
                    Version {latestVersion} • Available Now
                  </Badge>
                  {formattedDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Released {formattedDate}
                    </span>
                  )}
                </motion.div>
              ) : (
                <Badge className="mb-8 bg-gradient-primary text-primary-foreground px-4 py-2 text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Desktop App Available
                </Badge>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* Primary CTA - Web App */}
        <section className="pb-12 px-6">
          <motion.div 
            className="container mx-auto max-w-4xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-primary/30 shadow-glow-primary bg-gradient-to-r from-primary/5 to-accent/5">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Globe className="w-8 h-8 text-primary" />
                    </motion.div>
                    <Badge className="bg-gradient-primary">Recommended</Badge>
                  </div>
                  <CardTitle className="text-3xl">Use Web App</CardTitle>
                  <CardDescription className="text-lg">
                    No download required. Start streaming directly from your browser.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    {['Instant access', 'All core features', 'Cross-platform', 'Auto-updates'].map((item, i) => (
                      <motion.span 
                        key={item}
                        className="flex items-center gap-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <Check className="w-4 h-4 text-primary" /> {item}
                      </motion.span>
                    ))}
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" onClick={handleLaunchWebApp} className="text-lg px-8 py-6 shadow-glow-primary">
                      <Zap className="w-5 h-5 mr-2" />
                      Launch Web Studio
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Desktop Downloads */}
        <section className="pb-16 px-6">
          <motion.div 
            className="container mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <h2 className="text-2xl font-bold mb-2">Desktop App</h2>
              <p className="text-muted-foreground">
                For advanced features like global hotkeys, system tray, and local recording.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {sortedPlatforms.map((platform) => {
                let downloadUrl: string | null = null;
                let size: string | null = null;
                let downloads: number | null = null;
                
                for (const pattern of platform.patterns) {
                  downloadUrl = getAssetUrl(pattern);
                  if (downloadUrl) {
                    size = getAssetSize(pattern);
                    downloads = getAssetDownloads(pattern);
                    break;
                  }
                }
                
                if (!downloadUrl) {
                  downloadUrl = getAssetUrl(platform.fileExt);
                  size = getAssetSize(platform.fileExt);
                  downloads = getAssetDownloads(platform.fileExt);
                }
                
                const isAvailable = !!downloadUrl;
                const isRecommended = platform.osKey === userOS;

                return (
                  <motion.div
                    key={platform.name}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className={`relative h-full transition-all ${!isAvailable ? 'opacity-60' : 'hover:shadow-lg hover:border-primary/50'} bg-gradient-to-br ${platform.color} ${isRecommended && isAvailable ? 'ring-2 ring-primary/50' : ''}`}>
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {isRecommended && (
                          <Badge className="bg-primary text-primary-foreground shadow-lg text-[10px]">
                            <Sparkles className="w-3 h-3 mr-1" />
                            For You
                          </Badge>
                        )}
                        {isAvailable && !isRecommended && (
                          <Badge className="bg-success text-success-foreground shadow-lg">
                            <Check className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                      </div>
                      
                      <CardHeader className="text-center pb-3">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <platform.icon className="w-12 h-12 mx-auto mb-3 text-primary" />
                        </motion.div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription>
                          {isAvailable ? `v${latestVersion}` : 'Coming Soon'}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span className="font-mono">{size || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Requires:</span>
                            <span className="text-right text-xs">{platform.requirements}</span>
                          </div>
                          {downloads !== null && downloads > 0 && (
                            <div className="flex justify-between">
                              <span>Downloads:</span>
                              <span className="flex items-center gap-1 font-mono">
                                <FileDown className="w-3 h-3" />
                                {downloads.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            className="w-full" 
                            variant={isAvailable ? "default" : "secondary"}
                            disabled={!isAvailable && !hasReleases}
                            onClick={() => handleDownload(platform.name, downloadUrl)}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            {isAvailable ? "Download Now" : "Download"}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* GitHub Releases Link */}
            {releaseUrl && (
              <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <a href={releaseUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-5 h-5" />
                    View All Releases on GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </motion.div>
            )}

            {/* Release Notes */}
            {hasReleases && releaseNotes && (
              <motion.div
                className="max-w-3xl mx-auto mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Collapsible>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            What's New in v{latestVersion}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap text-sm">
                          {releaseNotes}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border">
                          <Button variant="ghost" size="sm" asChild className="text-primary">
                            <Link to="/changelog">
                              View Full Changelog →
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </motion.div>
            )}

            {/* Build Status Card - collapsible, always available */}
            <motion.div 
              className="max-w-2xl mx-auto mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {!hasReleases && !isLoading ? (
                <BuildStatusCard onUseWebApp={handleLaunchWebApp} />
              ) : (
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                      <Info className="w-4 h-4" />
                      Build & Release Info
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <BuildStatusCard onUseWebApp={handleLaunchWebApp} />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 bg-muted/30">
          <motion.div 
            className="container mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <Badge className="mb-4 bg-gradient-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Full Feature Set
              </Badge>
              <h2 className="text-3xl font-bold mb-4">What's Included</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every version includes the full suite of AI-powered streaming tools.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature) => (
                <motion.div 
                  key={feature} 
                  className="flex items-center gap-3 p-4 bg-background rounded-lg border hover:border-primary/50 transition-all"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Installation Instructions */}
        <section className="py-16 px-6">
          <motion.div 
            className="container mx-auto max-w-5xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-4">Installation Instructions</h2>
              <p className="text-muted-foreground">
                Get up and running in minutes.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-primary" />
                      Windows
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Download the .exe installer", "Run as administrator", "Follow setup wizard", "Launch from desktop"].map((step, i) => (
                      <motion.div 
                        key={step} 
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">
                          {i + 1}
                        </Badge>
                        <span className="text-sm">{step}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-primary" />
                      macOS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Download the .dmg file", "Open the downloaded file", "Drag to Applications", "Launch from Applications"].map((step, i) => (
                      <motion.div 
                        key={step} 
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">
                          {i + 1}
                        </Badge>
                        <span className="text-sm">{step}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-primary" />
                      Linux
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Download .AppImage or .deb", "chmod +x *.AppImage (AppImage)", "Run ./HyvoStreamStudio.AppImage", "Or: sudo dpkg -i *.deb"].map((step, i) => (
                      <motion.div 
                        key={step} 
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">
                          {i + 1}
                        </Badge>
                        <span className="text-sm font-mono text-xs">{step}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Security & Support */}
        <section className="py-16 px-6 bg-muted/30">
          <motion.div 
            className="container mx-auto max-w-4xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Shield className="w-5 h-5" />
                      Secure & Trusted
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground space-y-2">
                    <p>Open source and auditable. Your stream keys stay local, data encrypted end-to-end.</p>
                    <p className="text-xs">
                      <Info className="w-3 h-3 inline mr-1" />
                      Verify downloads by checking file hashes on the{" "}
                      <a 
                        href={`https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/releases`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        GitHub Releases page
                      </a>.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Zap className="w-5 h-5" />
                      24/7 Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    <p>Get help when you need it. Community Discord and email support available.</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default DownloadPage;
