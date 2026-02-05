 import { useState, useEffect, useCallback } from "react";
 
 interface BeforeInstallPromptEvent extends Event {
   prompt(): Promise<void>;
   userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
 }
 
 export function usePWA() {
   const [isOnline, setIsOnline] = useState(navigator.onLine);
   const [isInstalled, setIsInstalled] = useState(false);
   const [canInstall, setCanInstall] = useState(false);
   const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
 
   // Check if app is already installed
   useEffect(() => {
     const checkInstalled = () => {
       // Check if running in standalone mode (installed PWA)
       const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
       const isIosStandalone = (window.navigator as any).standalone === true;
       setIsInstalled(isStandalone || isIosStandalone);
     };
 
     checkInstalled();
     window.matchMedia("(display-mode: standalone)").addEventListener("change", checkInstalled);
 
     return () => {
       window.matchMedia("(display-mode: standalone)").removeEventListener("change", checkInstalled);
     };
   }, []);
 
   // Handle online/offline status
   useEffect(() => {
     const handleOnline = () => setIsOnline(true);
     const handleOffline = () => setIsOnline(false);
 
     window.addEventListener("online", handleOnline);
     window.addEventListener("offline", handleOffline);
 
     return () => {
       window.removeEventListener("online", handleOnline);
       window.removeEventListener("offline", handleOffline);
     };
   }, []);
 
   // Capture the install prompt
   useEffect(() => {
     const handleBeforeInstallPrompt = (e: Event) => {
       e.preventDefault();
       setDeferredPrompt(e as BeforeInstallPromptEvent);
       setCanInstall(true);
     };
 
     window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
 
     // Handle successful installation
     window.addEventListener("appinstalled", () => {
       setIsInstalled(true);
       setCanInstall(false);
       setDeferredPrompt(null);
     });
 
     return () => {
       window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
     };
   }, []);
 
   const promptInstall = useCallback(async () => {
     if (!deferredPrompt) return false;
 
     try {
       await deferredPrompt.prompt();
       const { outcome } = await deferredPrompt.userChoice;
       
       if (outcome === "accepted") {
         setIsInstalled(true);
         setCanInstall(false);
       }
       
       setDeferredPrompt(null);
       return outcome === "accepted";
     } catch (error) {
       console.error("Failed to prompt install:", error);
       return false;
     }
   }, [deferredPrompt]);
 
   return {
     isOnline,
     isInstalled,
     canInstall,
     promptInstall,
   };
 }