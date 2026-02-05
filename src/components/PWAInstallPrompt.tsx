 import { useState, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { X, Download, Smartphone, Wifi, WifiOff } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { usePWA } from "@/hooks/usePWA";
 
 export function PWAInstallPrompt() {
   const { isOnline, isInstalled, canInstall, promptInstall } = usePWA();
   const [showBanner, setShowBanner] = useState(false);
   const [dismissed, setDismissed] = useState(false);
 
   // Show install banner after a delay if not installed and not dismissed
   useEffect(() => {
     if (canInstall && !isInstalled && !dismissed) {
       const timer = setTimeout(() => setShowBanner(true), 5000);
       return () => clearTimeout(timer);
     }
   }, [canInstall, isInstalled, dismissed]);
 
   // Check if user previously dismissed
   useEffect(() => {
     const wasDismissed = localStorage.getItem("pwa-install-dismissed");
     if (wasDismissed) {
       const dismissedAt = parseInt(wasDismissed, 10);
       // Show again after 7 days
       if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
         setDismissed(true);
       }
     }
   }, []);
 
   const handleDismiss = () => {
     setShowBanner(false);
     setDismissed(true);
     localStorage.setItem("pwa-install-dismissed", Date.now().toString());
   };
 
   const handleInstall = async () => {
     const installed = await promptInstall();
     if (installed) {
       setShowBanner(false);
     }
   };
 
   return (
     <>
       {/* Offline Indicator */}
       <AnimatePresence>
         {!isOnline && (
           <motion.div
             initial={{ y: -100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -100, opacity: 0 }}
           className="fixed top-0 left-0 right-0 z-[100] bg-warning/90 backdrop-blur-sm text-warning-foreground py-2 px-4"
           >
             <div className="flex items-center justify-center gap-2 text-sm font-medium">
               <WifiOff className="w-4 h-4" />
               <span>You're offline. Some features may be limited.</span>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
 
       {/* Install Banner */}
       <AnimatePresence>
         {showBanner && !isInstalled && (
           <motion.div
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 100, opacity: 0 }}
             className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
           >
             <div className="liquid-glass-elevated rounded-2xl p-4 border border-white/20 shadow-2xl">
               <button
                 onClick={handleDismiss}
                 className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
 
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                   <Smartphone className="w-6 h-6 text-white" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="text-white font-semibold mb-1">Install Hyvo.ai</h3>
                   <p className="text-white/60 text-sm mb-3">
                     Add to your home screen for the best experience with offline access.
                   </p>
                   <div className="flex gap-2">
                     <Button
                       size="sm"
                       onClick={handleInstall}
                       className="gap-2 bg-gradient-primary"
                     >
                       <Download className="w-4 h-4" />
                       Install
                     </Button>
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={handleDismiss}
                       className="text-white/60"
                     >
                       Not now
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </>
   );
 }