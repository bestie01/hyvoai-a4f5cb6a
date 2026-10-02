import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/** Desktop only: finishes in-app Google/Discord/Twitch sign-in and opens the cockpit. */
export function DesktopOAuthBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    const api = (window as any).electronAPI;
    if (typeof api?.onOAuthResult !== "function") return;
    return api.onOAuthResult(async ({ code, error }: { code?: string; error?: string }) => {
      if (error || !code) {
        toast({ title: "Sign in failed", description: error ?? "Try again.", variant: "destructive" });
        return;
      }
      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exErr) {
        toast({ title: "Sign in failed", description: exErr.message, variant: "destructive" });
        return;
      }
      toast({ title: "Welcome to Hyvo" });
      navigate("/cockpit", { replace: true });
    });
  }, [navigate]);
  return null;
}
