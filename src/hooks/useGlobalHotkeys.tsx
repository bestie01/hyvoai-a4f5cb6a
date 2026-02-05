 import { useEffect, useCallback } from "react";
 import { useNavigate } from "react-router-dom";
 
 interface HotkeyAction {
   key: string;
   ctrl?: boolean;
   shift?: boolean;
   alt?: boolean;
   action: () => void;
   description: string;
 }
 
 export function useGlobalHotkeys() {
   const navigate = useNavigate();
 
   const hotkeys: HotkeyAction[] = [
     {
       key: "h",
       ctrl: true,
       action: () => navigate("/dashboard"),
       description: "Go to Dashboard",
     },
     {
       key: ",",
       ctrl: true,
       action: () => navigate("/settings"),
       description: "Open Settings",
     },
     {
       key: "l",
       ctrl: true,
       shift: true,
       action: () => navigate("/studio"),
       description: "Go to Studio",
     },
     {
       key: "k",
       ctrl: true,
       action: () => navigate("/schedule"),
       description: "Open Schedule",
     },
     {
       key: "p",
       ctrl: true,
       action: () => navigate("/profile"),
       description: "Open Profile",
     },
   ];
 
   const handleKeyDown = useCallback(
     (e: KeyboardEvent) => {
       // Don't trigger if user is typing in an input
       const target = e.target as HTMLElement;
       if (
         target.tagName === "INPUT" ||
         target.tagName === "TEXTAREA" ||
         target.isContentEditable
       ) {
         return;
       }
 
       for (const hotkey of hotkeys) {
         const ctrlMatch = hotkey.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
         const shiftMatch = hotkey.shift ? e.shiftKey : !e.shiftKey;
         const altMatch = hotkey.alt ? e.altKey : !e.altKey;
         const keyMatch = e.key.toLowerCase() === hotkey.key.toLowerCase();
 
         if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
           e.preventDefault();
           hotkey.action();
           return;
         }
       }
     },
     [navigate]
   );
 
   useEffect(() => {
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
   }, [handleKeyDown]);
 
   return { hotkeys };
 }