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
import { Download, Monitor, Shield, Zap, Check, Globe, ExternalLink, Loader2, Github, Sparkles, Apple, Terminal, ChevronDown, Clock, FileDown, Info, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";
import { BuildStatusCard } from "@/components/BuildStatusCard";
import { GITHUB_CONFIG } from "@/lib/constants";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type DetectedOS = "windows" | "macos" | "linux" | "unknown";

function detectOS(): DetectedOS {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}

/** Simple markdown-to-JSX renderer for release notes */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {listItems.map((li, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: li.replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={`h-${elements.length}`} className="text-base font-semibold text-foreground mt-3 mb-1">
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={`h4-${elements.length}`} className="text-sm font-semibold text-foreground mt-2 mb-1">
          {trimmed.slice(4)}
        </h4>
      );
    } else if (/^[-*] /.test(trimmed)) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
      );
    }
  }
  flushList();
  return elements;
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
    navigate("/studio");
  };

  const handleDownload = (platform: string, downloadUrl: string | null) => {
    if (!downloadUrl) {
      toast({
        title: "Download Not Available",
        description: `The ${platform} installer is not yet available.`,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Download Starting",
      description: `Downloading Hyvo Stream Studio for ${platform}...`,
    });
    window.open(downloadUrl, "_blank");
  };

  const platforms = [
    { name: "Windows", icon: Monitor, requirements: "Windows 10/11 (64-bit)", patterns: [".exe"], fileExt: ".exe", osKey: "windows" as DetectedOS },
    { name: "macOS (Intel)", icon: Apple, requirements: "macOS 11.0+ (Intel)", patterns: ["-x64.dmg", "x64.dmg", "-intel.dmg"], fileExt: ".dmg", osKey: "macos" as DetectedOS },
    { name: "macOS (Apple Silicon)", icon: Apple, requirements: "macOS 11.0+ (M1/M2/M3)", patterns: ["-arm64.dmg", "arm64.dmg", "-universal.dmg"], fileExt: ".dmg", osKey: "macos" as DetectedOS },
    { name: "Linux (AppImage)", icon: Terminal, requirements: "Any Linux distro", patterns: [".AppImage"], fileExt: ".AppImage", osKey: "linux" as DetectedOS },
    { name: "Linux (Debian)", icon: Terminal, requirements: "Ubuntu / Debian", patterns: [".deb"], fileExt: ".deb", osKey: "linux" as DetectedOS },
  ];

  const sortedPlatforms = useMemo(() => {
    if (userOS === "unknown") return platforms;
    return [...platforms].sort((a, b) => (a.osKey === userOS ? 0 : 1) - (b.osKey === userOS ? 0 : 1));
  }, [userOS]);

  // Compute hero download for detected OS
  const heroAsset = useMemo(() => {
    const osPlatform = platforms.find((p) => p.osKey === userOS);
    if (!osPlatform) return null;
    for (const pattern of osPlatform.patterns) {
      const url = getAssetUrl(pattern);
      if (url) return { url, size: getAssetSize(pattern), name: osPlatform.name, downloads: getAssetDownloads(pattern) };
    }
    const url = getAssetUrl(osPlatform.fileExt);
    if (url) return { url, size: getAssetSize(osPlatform.fileExt), name: osPlatform.name, downloads: getAssetDownloads(osPlatform.fileExt) };
    return null;
  }, [userOS, hasReleases]);

  // Total downloads across all assets
  const totalDownloads = useMemo(() => {
    let total = 0;
    for (const p of platforms) {
      for (const pat of p.patterns) {
        const d = getAssetDownloads(pat);
        if (d) total += d;
      }
    }
    return total;
  }, [hasReleases]);

  const formattedDate = releaseDate ? format(new Date(releaseDate), "MMM d, yyyy") : null;

  const features = [
    "Real-time stream monitoring",
    "AI-powered highlight detection",
    "Multi-platform streaming",
    "Advanced analytics dashboard",
    "Custom overlay creation",
    "Automated clip generation",
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero */}
        <section className="pt-32 pb-12 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <motion.div className="container mx-auto text-center relative z-10" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Get Hyvo Stream Studio
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Download the desktop app for advanced features, or launch instantly in your browser.
              </p>

              {isLoading ? (
                <Badge variant="secondary" className="mb-6">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Checking releases…
                </Badge>
              ) : hasReleases ? (
                <div className="flex flex-col items-center gap-2 mb-6">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5">
                    <Github className="w-3.5 h-3.5 mr-1.5" /> v{latestVersion}
                    {formattedDate && <span className="ml-2 text-muted-foreground">• {formattedDate}</span>}
                  </Badge>
                  {totalDownloads > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileDown className="w-3 h-3" /> {totalDownloads.toLocaleString()} total downloads
                    </span>
                  )}
                </div>
              ) : null}
            </motion.div>

            {/* Hero CTA for detected OS */}
            {heroAsset && (
              <motion.div variants={itemVariants} className="mb-4">
                <Button
                  size="lg"
                  className="text-lg px-8 py-7 rounded-xl shadow-lg"
                  onClick={() => handleDownload(heroAsset.name, heroAsset.url)}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download for {heroAsset.name}
                  {heroAsset.size && <span className="ml-2 opacity-70 text-sm">({heroAsset.size})</span>}
                </Button>
              </motion.div>
            )}

            {/* Secondary: Web App */}
            <motion.div variants={itemVariants}>
              <Button variant="outline" size="lg" onClick={handleLaunchWebApp} className="gap-2">
                <Globe className="w-4 h-4" /> Launch Web App — no download needed
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Platform cards */}
        <section className="pb-16 px-6">
          <motion.div className="container mx-auto" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <h2 className="text-2xl font-bold mb-2">All Platforms</h2>
              <p className="text-muted-foreground text-sm">Choose your platform below.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {sortedPlatforms.map((platform) => {
                let downloadUrl: string | null = null;
                let size: string | null = null;
                let downloads: number | null = null;

                for (const pattern of platform.patterns) {
                  downloadUrl = getAssetUrl(pattern);
                  if (downloadUrl) { size = getAssetSize(pattern); downloads = getAssetDownloads(pattern); break; }
                }
                if (!downloadUrl) { downloadUrl = getAssetUrl(platform.fileExt); size = getAssetSize(platform.fileExt); downloads = getAssetDownloads(platform.fileExt); }

                const isAvailable = !!downloadUrl;
                const isRecommended = platform.osKey === userOS;

                return (
                  <motion.div key={platform.name} variants={itemVariants} whileHover={{ y: -4 }}>
                    <Card className={`relative h-full transition-all border ${isRecommended && isAvailable ? "border-primary/50 shadow-md" : "border-border"} ${!isAvailable ? "opacity-50" : "hover:border-primary/30"}`}>
                      {isRecommended && isAvailable && (
                        <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] px-2">
                          <Sparkles className="w-3 h-3 mr-1" /> Recommended
                        </Badge>
                      )}
                      <CardHeader className="pb-2 pt-5 text-center">
                        <platform.icon className="w-10 h-10 mx-auto mb-2 text-primary" />
                        <CardTitle className="text-base">{platform.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="text-xs text-muted-foreground space-y-1">
                          {isAvailable && <div className="flex justify-between"><span>Version</span><span className="font-mono">v{latestVersion}</span></div>}
                          {size && <div className="flex justify-between"><span>Size</span><span className="font-mono">{size}</span></div>}
                          {downloads != null && downloads > 0 && (
                            <div className="flex justify-between"><span>Downloads</span><span className="font-mono flex items-center gap-1"><FileDown className="w-3 h-3" />{downloads.toLocaleString()}</span></div>
                          )}
                        </div>
                        <Button
                          className="w-full"
                          size="sm"
                          variant={isAvailable ? "default" : "secondary"}
                          disabled={!isAvailable}
                          onClick={() => handleDownload(platform.name, downloadUrl)}
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          {isAvailable ? "Download" : "Coming Soon"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* GitHub + Changelog links */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {releaseUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={releaseUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-1.5" /> GitHub Releases <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/changelog">
                  View Full Changelog <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Release Notes */}
            {hasReleases && releaseNotes && (
              <motion.div className="max-w-3xl mx-auto mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Collapsible>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            What's New in v{latestVersion}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-2">
                        {renderMarkdown(releaseNotes)}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </motion.div>
            )}

            {/* Build Status */}
            <div className="max-w-2xl mx-auto mt-8">
              {!hasReleases && !isLoading ? (
                <BuildStatusCard onUseWebApp={handleLaunchWebApp} />
              ) : (
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                      <Info className="w-3 h-3" /> Build & Release Info <ChevronDown className="w-3 h-3" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <BuildStatusCard onUseWebApp={handleLaunchWebApp} />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 border-t border-border">
          <motion.div className="container mx-auto max-w-4xl" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 className="text-2xl font-bold text-center mb-8" variants={itemVariants}>What's Included</motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <motion.div key={f} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card" variants={itemVariants}>
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Installation */}
        <section className="py-16 px-6 bg-muted/30">
          <motion.div className="container mx-auto max-w-5xl" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 className="text-2xl font-bold text-center mb-8" variants={itemVariants}>Installation</motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Monitor, title: "Windows", steps: ["Download the .exe installer", "Run as administrator", "Follow setup wizard", "Launch from desktop"] },
                { icon: Apple, title: "macOS", steps: ["Download the .dmg file", "Open the downloaded file", "Drag to Applications", "Launch from Applications"] },
                { icon: Terminal, title: "Linux", steps: ["Download .AppImage or .deb", "chmod +x *.AppImage", "Run ./HyvoStreamStudio.AppImage", "Or: sudo dpkg -i *.deb"] },
              ].map((inst) => (
                <motion.div key={inst.title} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <inst.icon className="w-4 h-4 text-primary" /> {inst.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {inst.steps.map((step, i) => (
                        <div key={step} className="flex gap-2 text-sm">
                          <span className="text-xs text-muted-foreground font-mono w-4 flex-shrink-0">{i + 1}.</span>
                          <span className={inst.title === "Linux" ? "font-mono text-xs" : ""}>{step}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* System Requirements */}
        <section className="py-12 px-6">
          <motion.div className="container mx-auto max-w-3xl" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 className="text-xl font-bold text-center mb-6" variants={itemVariants}>System Requirements</motion.h2>
            <motion.div variants={itemVariants} className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Platform</th>
                    <th className="text-left p-3 font-medium">Minimum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 font-medium">Windows</td><td className="p-3 text-muted-foreground">Windows 10/11 (64-bit)</td></tr>
                  <tr><td className="p-3 font-medium">macOS</td><td className="p-3 text-muted-foreground">macOS 11.0+ (Intel or Apple Silicon)</td></tr>
                  <tr><td className="p-3 font-medium">Linux</td><td className="p-3 text-muted-foreground">Ubuntu 18.04+ or equivalent</td></tr>
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </section>

        {/* Security */}
        <section className="py-12 px-6 border-t border-border">
          <motion.div className="container mx-auto max-w-4xl" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" /> Secure & Open Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>Your stream keys stay local. Data encrypted end-to-end. Verify downloads on the{" "}
                      <a href={`https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/releases`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                        GitHub Releases page
                      </a>.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" /> 24/7 Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>Community Discord and email support available whenever you need help.</p>
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
