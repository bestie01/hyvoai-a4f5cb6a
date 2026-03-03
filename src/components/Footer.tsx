import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Youtube, Mail, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
const Footer = () => {
  const footerLinks = {
    product: [{
      label: "Features",
      href: "/#features"
    }, {
      label: "Pricing",
      href: "/pricing"
    }, {
      label: "Dashboard",
      href: "/dashboard"
    }, {
      label: "Studio",
      href: "/studio"
    }, {
      label: "Download",
      href: "/download"
    }],
    resources: [{
      label: "Community",
      href: "/community"
    }, {
      label: "Growth Tips",
      href: "/growth"
    }, {
      label: "Schedule",
      href: "/schedule"
    }, {
      label: "Settings",
      href: "/settings"
    }, {
      label: "Support",
      href: "mailto:support@hyvo.ai",
      external: true
    }],
    company: [{
      label: "About",
      href: "/#features"
    }, {
      label: "Creators",
      href: "/community"
    }, {
      label: "Native Features",
      href: "/native"
    }, {
      label: "Contact",
      href: "mailto:hello@hyvo.ai",
      external: true
    }],
    legal: [{
      label: "Privacy Policy",
      href: "/#features"
    }, {
      label: "Terms of Service",
      href: "/#features"
    }]
  };
  const socialLinks = [{
    icon: Github,
    href: "https://github.com/bestie01/hyvoai-a4f5cb6a",
    label: "GitHub"
  }, {
    icon: Youtube,
    href: "https://youtube.com/@hyvoai",
    label: "YouTube"
  }];
  return <footer className="bg-background border-t border-border/50 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <FadeIn>
              <Link to="/" className="flex items-center gap-4 group">
                <motion.div className="w-14 h-14 flex items-center justify-center bg-gradient-primary rounded-2xl p-3 shadow-glow-primary" whileHover={{
                scale: 1.05,
                rotate: 5
              }}>
                  <img src="/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png" alt="Hyvo.ai Logo" className="w-full h-full object-contain brightness-0 invert dark:brightness-100 dark:invert-0" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold text-gradient-primary text-secondary-foreground">
                    Hyvo.ai
                  </span>
                  <Badge variant="secondary" className="text-[10px] w-fit bg-primary/10 text-primary border-0 mt-1">
                    AI-Powered
                  </Badge>
                </div>
              </Link>
              
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Revolutionary AI-powered streaming platform that automates operations, 
                analyzes audience behavior, and optimizes content performance.
              </p>
              
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => <motion.a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="w-11 h-11 rounded-xl bg-card/80 hover:bg-primary/10 border border-border/60 hover:border-primary/50 flex items-center justify-center transition-all duration-300 group" whileHover={{
                scale: 1.1,
                y: -3
              }} whileTap={{
                scale: 0.95
              }} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.1
              }}>
                    <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>)}
              </div>
            </FadeIn>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => <FadeIn key={category} delay={categoryIndex * 0.1}>
              <div className="space-y-5">
                <h3 className="font-semibold text-foreground capitalize text-sm tracking-wide">{category}</h3>
                <ul className="space-y-3.5">
                  {links.map((link: { label: string; href: string; external?: boolean }) => <li key={link.label}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
                          <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-300" />
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
                          <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-300" />
                          {link.label}
                        </Link>
                      )}
                    </li>)}
                </ul>
              </div>
            </FadeIn>)}
        </div>

        <Separator className="mb-10 bg-border/50" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <FadeIn delay={0.4}>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Hyvo.ai © 2026. All rights reserved.</span>
              <span className="hidden md:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                Made with <Heart className="w-3.5 h-3.5 text-destructive animate-pulse" /> and AI
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <a href="mailto:hello@hyvo.ai" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Us
              </a>
            </Button>
          </FadeIn>
        </div>
      </div>
    </footer>;
};
export default Footer;