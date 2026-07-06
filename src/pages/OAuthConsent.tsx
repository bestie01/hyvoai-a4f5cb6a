import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";

// Beta oauth namespace on supabase-js; wrap with a local type.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as any).oauth as OAuthApi;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?redirect=" + encodeURIComponent(next);
        return;
      }
      if (!oauth?.getAuthorizationDetails) {
        return setError("OAuth server API unavailable on this Supabase client version.");
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) { window.location.href = immediate; return; }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("No redirect returned by the authorization server."); }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
        <Card className="max-w-md w-full bg-zinc-900/60 border-zinc-800">
          <CardHeader><CardTitle>Authorization error</CardTitle></CardHeader>
          <CardContent className="text-sm text-white/70">{error}</CardContent>
        </Card>
      </main>
    );
  }
  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "an application";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <Card className="max-w-md w-full bg-zinc-900/60 backdrop-blur-md border-zinc-800 rounded-xl">
        <CardHeader>
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <CardTitle>Connect {clientName} to Hyvo.ai</CardTitle>
          <CardDescription>
            {clientName} will be able to act on your Hyvo.ai account, including reading your streams and analytics
            and running AI tools on your behalf.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-white/50">
          You can revoke this access at any time from your Hyvo settings.
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button variant="ghost" disabled={busy} onClick={() => decide(false)}>Deny</Button>
          <Button disabled={busy} onClick={() => decide(true)}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Approve
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
