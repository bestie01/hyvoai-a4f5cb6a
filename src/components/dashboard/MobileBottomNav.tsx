 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Home, Radio, Users, MoreHorizontal, Plus } from "lucide-react";
 import { useNavigate, useLocation } from "react-router-dom";
 import { useHaptics } from "@/hooks/useHaptics";
 import { ImpactStyle } from "@capacitor/haptics";
 import { cn } from "@/lib/utils";
 
 const navItems = [
   { icon: Home, label: "Home", path: "/dashboard" },
   { icon: Radio, label: "Studio", path: "/studio" },
   { icon: Plus, label: "Go Live", path: "/studio", isCenter: true },
   { icon: Users, label: "Community", path: "/community" },
   { icon: MoreHorizontal, label: "More", path: "/settings" },
 ];
 
 export function MobileBottomNav() {
   const navigate = useNavigate();
   const location = useLocation();
   const { impact } = useHaptics();
   const [tapped, setTapped] = useState<string | null>(null);
 
   const handleNavClick = (item: typeof navItems[0]) => {
     impact(ImpactStyle.Light);
     setTapped(item.label);
     setTimeout(() => setTapped(null), 200);
     navigate(item.path);
   };
 
   const isActive = (path: string) => location.pathname === path;
 
   return (
     <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
       {/* Gradient fade above nav */}
       <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
       
       <div 
         className="liquid-glass-panel border-t border-white/10 backdrop-blur-xl"
         style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
       >
         <div className="flex items-center justify-around h-16 px-2">
           {navItems.map((item) => {
             const active = isActive(item.path);
             const isTapped = tapped === item.label;
             
             if (item.isCenter) {
               return (
                 <motion.button
                   key={item.label}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => handleNavClick(item)}
                   className="relative -mt-6"
                 >
                   <div className="w-14 h-14 rounded-full bg-gradient-primary shadow-glow-primary flex items-center justify-center relative">
                     <item.icon className="w-6 h-6 text-white" />
                     {/* Pulse ring */}
                     <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                   </div>
                 </motion.button>
               );
             }
 
             return (
               <motion.button
                 key={item.label}
                 whileTap={{ scale: 0.9 }}
                 animate={isTapped ? { y: -4 } : { y: 0 }}
                 onClick={() => handleNavClick(item)}
                 className={cn(
                   "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px]",
                   active 
                     ? "text-primary" 
                     : "text-white/50 hover:text-white/80"
                 )}
               >
                 <div className="relative">
                   <item.icon className="w-5 h-5" />
                   {/* Active indicator dot */}
                   <AnimatePresence>
                     {active && (
                       <motion.div
                         initial={{ scale: 0, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0, opacity: 0 }}
                         className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                       />
                     )}
                   </AnimatePresence>
                 </div>
                 <span className="text-[10px] font-medium">{item.label}</span>
               </motion.button>
             );
           })}
         </div>
       </div>
     </nav>
   );
 }