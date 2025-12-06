import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Monitor, Smartphone, Shield, Zap, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DownloadPage = () => {
  const { toast } = useToast();
  // GitHub releases URL - update with your actual GitHub username/repo
  const githubReleasesBase = "https://github.com/YOUR_USERNAME/hyvo-stream-studio/releases/latest/download";
  
  const platforms = [
    {
      name: "Windows",
      icon: Monitor,
      version: "1.0.0",
      size: "~120 MB",
      requirements: "Windows 10/11 (64-bit)",
      downloadUrl: `${githubReleasesBase}/Hyvo-Stream-Studio-Setup-1.0.0.exe`,
      primary: true
    },
    {
      name: "macOS",
      icon: Monitor,
      version: "1.0.0", 
      size: "~125 MB",
      requirements: "macOS 11.0 or later",
      downloadUrl: `${githubReleasesBase}/Hyvo-Stream-Studio-1.0.0.dmg`,
      primary: true
    },
    {
      name: "Linux",
      icon: Monitor,
      version: "1.0.0",
      size: "~115 MB", 
      requirements: "Ubuntu 18.04+ or equivalent",
      downloadUrl: `${githubReleasesBase}/Hyvo-Stream-Studio-1.0.0.AppImage`,
      primary: true
    },
    {
      name: "Mobile App",
      icon: Smartphone,
      version: "Coming Soon",
      size: "TBD",
      requirements: "iOS 14+ / Android 8+",
      downloadUrl: "#",
      primary: false
    }
  ];

  const handleDownload = (platform: typeof platforms[0]) => {
    if (platform.primary && platform.downloadUrl !== "#") {
      toast({
        title: "Download Starting",
        description: `Preparing Hyvo Stream Studio installer for ${platform.name}`,
      });
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = platform.downloadUrl;
      link.download = platform.downloadUrl.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message and redirect to studio
      setTimeout(() => {
        toast({
          title: "Download Complete!",
          description: "Check your downloads folder and run the installer",
        });
        setTimeout(() => {
          window.location.href = '/studio';
        }, 2000);
      }, 1000);
    }
  };

  const features = [
    "Real-time stream monitoring",
    "AI-powered highlight detection", 
    "Multi-platform streaming support",
    "Advanced analytics dashboard",
    "Custom overlay creation",
    "Automated clip generation"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Download Hyvo Stream Studio
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get the most powerful AI streaming assistant on your desktop. Available for Windows and macOS.
          </p>
          
          <Badge variant="secondary" className="mb-12">
            Version 1.0.0 • Latest Release
          </Badge>
        </div>
      </section>

      {/* Download Cards */}
      <section className="pb-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {platforms.map((platform) => (
              <Card key={platform.name} className={`relative ${platform.primary ? 'border-primary shadow-lg' : 'opacity-75'}`}>
                {platform.primary && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                    Recommended
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <platform.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-2xl">{platform.name}</CardTitle>
                  <CardDescription>Version {platform.version}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>File size:</span>
                      <span>{platform.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requirements:</span>
                      <span className="text-right">{platform.requirements}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={platform.primary ? "default" : "secondary"}
                    disabled={!platform.primary}
                    onClick={() => handleDownload(platform)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {platform.primary ? "Download Now" : "Coming Soon"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What's Included</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every download includes the full suite of AI-powered streaming tools to help you grow your audience.
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
              Get up and running in minutes with our simple installation process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Windows Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge>
                  <span>Download the .exe installer</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                  <span>Run the installer as administrator</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                  <span>Follow the setup wizard</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">4</Badge>
                  <span>Launch Hyvo Stream Studio from desktop</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  macOS Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge>
                  <span>Download the .dmg file</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                  <span>Open the downloaded file</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                  <span>Drag Hyvo Stream Studio to Applications</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">4</Badge>
                  <span>Launch from Applications folder</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Support */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Shield className="w-5 h-5" />
                  Secure & Trusted
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-600 dark:text-green-300">
                <p>Code-signed and verified. Your data stays secure with end-to-end encryption and local processing.</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Zap className="w-5 h-5" />
                  24/7 Support
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-600 dark:text-blue-300">
                <p>Get help when you need it. Our support team is available around the clock via chat and email.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DownloadPage;