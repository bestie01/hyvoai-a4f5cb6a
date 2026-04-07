import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Menu, X, User, Settings, LogOut, Crown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";
import { getNavRoutes, isRouteActive } from "@/lib/routes";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isPro, subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavRoutes();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-b border-border/30 shadow-sm supports-[backdrop-filter]:bg-background/70" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div className="w-12 h-12 flex items-center justify-center bg-gradient-primary rounded-xl p-2 shadow-glow-primary" whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
              <img src="/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png" alt="Hyvo.ai Logo" className="w-full h-full object-contain brightness-0 invert dark:brightness-100 dark:invert-0" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent bg-primary-foreground">Hyvo.ai</span>
              <Badge variant="secondary" className="text-[10px] w-fit bg-gradient-primary/20 text-primary border-0">AI-Powered</Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.div key={item.path + item.label} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Link
                  to={item.path}
                  className={`text-sm font-medium transition-colors relative group ${
                    isRouteActive(location.pathname, item.path) ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    isRouteActive(location.pathname, item.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user && <NotificationCenter />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback>{user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                        {isPro && <Badge variant="secondary" className="bg-gradient-primary text-white text-xs"><Crown className="w-3 h-3 mr-1" />{subscription.subscription_tier}</Badge>}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}><User className="mr-2 h-4 w-4" /><span>Profile</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/studio")}><Settings className="mr-2 h-4 w-4" /><span>Studio</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" /><span>Sign out</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>Start Free Trial</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div className="md:hidden mt-4 pb-4 border-t border-border overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <div className="flex flex-col gap-4 pt-4">
                {navItems.map((item, index) => (
                  <motion.div key={item.path + item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <Link to={item.path} className={`py-2 block transition-colors ${isRouteActive(location.pathname, item.path) ? "text-primary font-semibold" : "text-foreground hover:text-primary"}`} onClick={() => setIsMenuOpen(false)}>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div className="flex flex-col gap-3 pt-4 border-t border-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <ThemeToggle />
                    {user && <NotificationCenter />}
                  </div>
                  {user ? (
                    <>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}><User className="mr-2 h-4 w-4" />Profile</Button>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/studio"); setIsMenuOpen(false); }}><Settings className="mr-2 h-4 w-4" />Studio</Button>
                      <Button variant="outline" size="sm" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign Out</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>Sign In</Button>
                      <Button variant="hero" size="sm" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>Start Free Trial</Button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
