import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/animations/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ExternalLink, FileDown, ChevronDown, Tag, Calendar, Download, ArrowLeft, Monitor, Apple, Terminal } from "lucide-react";
import { useAllGitHubReleases } from "@/hooks/useAllGitHubReleases";
import { format } from "date-fns";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function getPlatformIcon(name: string) {
  const n = name.toLowerCase();
  if (n.endsWith(".exe") || n.includes("win")) return Monitor;
  if (n.endsWith(".dmg") || n.endsWith(".zip") && n.includes("mac")) return Apple;
  if (n.endsWith(".appimage") || n.endsWith(".deb") || n.includes("linux")) return Terminal;
  return FileDown;
}

function getPlatformLabel(name: string) {
  const n = name.toLowerCase();
  if (n.endsWith(".exe")) return "Windows";
  if (n.includes("arm64") && n.endsWith(".dmg")) return "macOS (Apple Silicon)";
  if (n.endsWith(".dmg")) return "macOS";
  if (n.endsWith(".appimage")) return "Linux (AppImage)";
  if (n.endsWith(".deb")) return "Linux (Debian)";
  if (n.endsWith(".zip") && n.includes("mac")) return "macOS";
  return null;
}

/** Simple markdown-to-JSX renderer */
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
    if (!trimmed) { flushList(); continue; }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(<h3 key={`h-${elements.length}`} className="text-base font-semibold text-foreground mt-3 mb-1">{trimmed.slice(3)}</h3>);
    } else if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(<h4 key={`h4-${elements.length}`} className="text-sm font-semibold text-foreground mt-2 mb-1">{trimmed.slice(4)}</h4>);
    } else if (/^[-*] /.test(trimmed)) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList();
      elements.push(<p key={`p-${elements.length}`} className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />);
    }
  }
  flushList();
  return elements;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Changelog = () => {
  const { releases, isLoading, error } = useAllGitHubReleases();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <ScrollToTop />

        {/* Hero */}
        <section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-30" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Tag className="w-3 h-3 mr-1" /> Release History
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Changelog
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Every update, improvement, and fix — all in one place.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/download">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Downloads
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20">
          <div className="container mx-auto px-6 max-w-3xl">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <Card className="border-destructive/50">
                <CardContent className="pt-6 text-center text-destructive">
                  Failed to load releases: {error}
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && releases.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No releases published yet. Check back soon!
                </CardContent>
              </Card>
            )}

            {!isLoading && releases.length > 0 && (
              <motion.div className="space-y-6 relative" variants={containerVariants} initial="hidden" animate="visible">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-8 bottom-8 w-px bg-border hidden md:block" />

                {releases.map((release, index) => {
                  const totalDownloads = release.assets.reduce((sum, a) => sum + a.download_count, 0);

                  return (
                    <motion.div key={release.tag_name} variants={itemVariants} className="relative md:pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-[14px] top-7 w-[11px] h-[11px] rounded-full border-2 border-primary bg-background hidden md:block" />

                      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant={index === 0 ? "default" : "secondary"} className={index === 0 ? "bg-primary text-primary-foreground" : ""}>
                              {release.tag_name}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">Latest</Badge>
                            )}
                            {release.prerelease && (
                              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600">Pre-release</Badge>
                            )}
                            {totalDownloads > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                                <Download className="w-3 h-3" /> {totalDownloads.toLocaleString()} downloads
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-lg">{release.name || release.tag_name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(release.published_at), "MMMM d, yyyy")}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Rendered release notes */}
                          {release.body && (
                            <div className="space-y-1">
                              {renderMarkdown(release.body)}
                            </div>
                          )}

                          {/* Download assets */}
                          {release.assets.length > 0 && (
                            <Collapsible>
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors py-2 border-t border-border pt-4">
                                  <span className="flex items-center gap-2">
                                    <FileDown className="w-4 h-4" />
                                    {release.assets.length} download{release.assets.length !== 1 ? "s" : ""} available
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="space-y-2 mt-2">
                                  {release.assets.map((asset) => {
                                    const PlatIcon = getPlatformIcon(asset.name);
                                    const label = getPlatformLabel(asset.name);
                                    return (
                                      <a
                                        key={asset.name}
                                        href={asset.browser_download_url}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <PlatIcon className="w-4 h-4 text-primary flex-shrink-0" />
                                          <div className="min-w-0">
                                            <span className="text-sm font-medium truncate block">{asset.name}</span>
                                            {label && <span className="text-xs text-muted-foreground">{label}</span>}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
                                          <span>{formatFileSize(asset.size)}</span>
                                          <span>{asset.download_count.toLocaleString()} ↓</span>
                                        </div>
                                      </a>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          {/* GitHub link */}
                          <div className="pt-2">
                            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
                              <a href={release.html_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View on GitHub
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Changelog;
