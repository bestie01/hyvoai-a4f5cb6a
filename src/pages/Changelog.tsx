import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageTransition } from "@/components/animations/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ExternalLink, FileDown, ChevronDown, Tag, Calendar, Download, ArrowLeft } from "lucide-react";
import { useAllGitHubReleases } from "@/hooks/useAllGitHubReleases";
import { format } from "date-fns";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
              <motion.div
                className="space-y-6 relative"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Timeline line */}
                <div className="absolute left-[19px] top-8 bottom-8 w-px bg-border hidden md:block" />

                {releases.map((release, index) => (
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
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              Latest
                            </Badge>
                          )}
                          {release.prerelease && (
                            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600">
                              Pre-release
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">
                          {release.name || release.tag_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(release.published_at), "MMMM d, yyyy")}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Release notes */}
                        {release.body && (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                            {release.body}
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
                                {release.assets.map((asset) => (
                                  <a
                                    key={asset.name}
                                    href={asset.browser_download_url}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <Download className="w-4 h-4 text-primary flex-shrink-0" />
                                      <span className="text-sm font-medium truncate">{asset.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
                                      <span>{formatFileSize(asset.size)}</span>
                                      <span>{asset.download_count.toLocaleString()} downloads</span>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}

                        {/* GitHub link */}
                        <div className="pt-2">
                          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
                            <a href={release.html_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                              View on GitHub
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
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
