 import { useGlobalHotkeys } from "@/hooks/useGlobalHotkeys";
 
 export function GlobalHotkeysProvider() {
   // This component just initializes the global hotkeys
   useGlobalHotkeys();
   return null;
 }