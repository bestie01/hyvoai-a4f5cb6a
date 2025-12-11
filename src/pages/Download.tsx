import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Monitor, Smartphone, Shield, Zap, Check, Globe, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";

const DownloadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    latestVersion, 
    releaseUrl, 
    isLoading, 
    hasReleases, 
    getAssetUrl, 
    getAssetSize 
  } = useGitHubReleases();

  const handleLaunchWebApp = () => {
    navigate('/studio');
  };

  const handleDownload = (platform: string, downloadUrl: string | null) => {
    if (!downloadUrl) {
      toast({
        title: "Download Not Available",
        description: `The ${platform} installer is not yet available. Use the Web App instead!`,
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
      primary: true,
    },
    {
      name: "macOS (Intel)",
      icon: Monitor,
      requirements: "macOS 11.0+ (Intel)",
      patterns: ["-x64.dmg", "x64.dmg", "-intel.dmg"],
      fileExt: ".dmg",
      primary: true,
    },
    {
      name: "macOS (Apple Silicon)",
      icon: Monitor,
      requirements: "macOS 11.0+ (M1/M2/M3)",
      patterns: ["-arm64.dmg", "arm64.dmg", "-universal.dmg"],
      fileExt: ".dmg",
      primary: true,
    },
    {
      name: "Linux (AppImage)",
      icon: Monitor,
      requirements: "Any Linux distro",
      patterns: [".AppImage"],
      fileExt: ".AppImage",
      primary: true,
    },
    {
      name: "Linux (Debian)",
      icon: Monitor,
      requirements: "Ubuntu/Debian",
      patterns: [".deb"],
      fileExt: ".deb",
      primary: false,
    },
  ];

  const features = [
    "Real-time stream monitoring",
    "AI-powered highlight detection",
    "Multi-platform streaming support",
    "Advanced analytics dashboard",
    "Custom overlay creation",
    "Automated clip generation",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
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
            <Badge variant="secondary" className="mb-8">
              Version {latestVersion} • Latest Release
            </Badge>
          ) : (
            <Badge variant="outline" className="mb-8">
              Desktop builds coming soon
            </Badge>
          )}
        </div>
      </section>

      {/* Primary CTA - Web App */}
      <section className="pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-8 h-8 text-primary" />
                <Badge className="bg-primary">Recommended</Badge>
              </div>
              <CardTitle className="text-3xl">Use Web App</CardTitle>
              <CardDescription className="text-lg">
                No download required. Start streaming directly from your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Instant access</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> All core features</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Cross-platform</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Auto-updates</span>
              </div>
              <Button size="lg" onClick={handleLaunchWebApp} className="text-lg px-8 py-6">
                <Zap className="w-5 h-5 mr-2" />
                Launch Web Studio
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Desktop Downloads */}
      <section className="pb-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Desktop App</h2>
            <p className="text-muted-foreground">
              For advanced features like global hotkeys, system tray, and local recording.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {platforms.map((platform) => {
              // Try each pattern to find a matching asset
              let downloadUrl: string | null = null;
              let size: string | null = null;
              
              for (const pattern of platform.patterns) {
                downloadUrl = getAssetUrl(pattern);
                if (downloadUrl) {
                  size = getAssetSize(pattern);
                  break;
                }
              }
              
              // Fallback: try the file extension directly
              if (!downloadUrl) {
                downloadUrl = getAssetUrl(platform.fileExt);
                size = getAssetSize(platform.fileExt);
              }
              
              const isAvailable = !!downloadUrl;

              return (
                <Card key={platform.name} className={`relative ${!isAvailable ? 'opacity-60' : ''}`}>
                  <CardHeader className="text-center pb-3">
                    <platform.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <CardDescription>
                      {isAvailable ? `v${latestVersion}` : 'Coming Soon'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{size || 'TBD'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requires:</span>
                        <span className="text-right text-xs">{platform.requirements}</span>
                      </div>
                    </div>
                    
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
                      {isAvailable ? "Download" : "Coming Soon"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* GitHub Releases Link */}
          {releaseUrl && (
            <div className="text-center mt-6">
              <Button variant="link" asChild>
                <a href={releaseUrl} target="_blank" rel="noopener noreferrer">
                  View all releases on GitHub <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </div>
          )}

          {!hasReleases && !isLoading && (
            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-2 text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Desktop builds are being prepared. Use the Web App for now!</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What's Included</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every version includes the full suite of AI-powered streaming tools.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Installation Instructions</h2>
            <p className="text-muted-foreground">
              Get up and running in minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Windows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Download the .exe installer", "Run as administrator", "Follow setup wizard", "Launch from desktop"].map((step, i) => (
                  <div key={step} className="flex gap-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">
                      {i + 1}
                    </Badge>
                    <span>{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  macOS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Download the .dmg file", "Open the downloaded file", "Drag to Applications", "Launch from Applications"].map((step, i) => (
                  <div key={step} className="flex gap-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">
                      {i + 1}
                    </Badge>
                    <span>{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Support */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Shield className="w-5 h-5" />
                  Secure & Trusted
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>Open source and auditable. Your stream keys stay local, data encrypted end-to-end.</p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30 bg-blue-500/5">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default DownloadPage;
