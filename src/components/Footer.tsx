import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Youtube, Mail, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Studio", href: "/studio" },
      { label: "Download", href: "/download" },
    ],
    resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Community", href: "/community" },
      { label: "Growth Tips", href: "/growth" },
      { label: "API", href: "/api" },
      { label: "Support", href: "/support" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press Kit", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Cookies", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/hyvoai", label: "Twitter" },
    { icon: Github, href: "https://github.com/hyvoai", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/hyvoai", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com/@hyvoai", label: "YouTube" },
  ];

  return (
    <footer className="bg-background border-t border-border relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background pointer-events-none" />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <FadeIn>
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div 
                  className="w-12 h-12 flex items-center justify-center bg-gradient-primary rounded-xl p-2 shadow-glow-primary"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <img 
                    src="/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png" 
                    alt="Hyvo.ai Logo" 
                    className="w-full h-full object-contain brightness-0 invert dark:brightness-100 dark:invert-0" 
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Hyvo.ai
                  </span>
                  <Badge variant="secondary" className="text-[10px] w-fit bg-gradient-primary/20 text-primary border-0">
                    AI-Powered
                  </Badge>
                </div>
              </Link>
              
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Revolutionary AI-powered streaming platform that automates operations, 
                analyzes audience behavior, and optimizes content performance.
              </p>
              
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-secondary/50 hover:bg-primary/10 border border-border hover:border-primary/50 flex items-center justify-center transition-all duration-300 group"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <FadeIn key={category} delay={categoryIndex * 0.1}>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground capitalize">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <FadeIn delay={0.4}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {currentYear} Hyvo.ai. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-destructive animate-pulse" /> and AI
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="mailto:hello@hyvo.ai" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
