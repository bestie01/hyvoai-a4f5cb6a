import { useEffect, useState } from "react";

/**
 * Web-side handoff for desktop sign-in.
 * The desktop app starts a loopback receiver on 127.0.0.1:47829 and opens the
 * user's preferred browser for OAuth. Supabase redirects here with the auth
 * code; this page forwards it to the loopback receiver so the desktop app can
 * finish the PKCE exchange, then shows a "return to Hyvo" message.
 */
export default function DesktopAuthCallback() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = window.location.search;
    if (!params || params.length < 2) {
      setFailed(true);
      return;
    }
    // Hand the code to the desktop app's loopback receiver.
    window.location.replace(`http://127.0.0.1:47829/auth/callback${params}`);
    // If the desktop app isn't listening, the navigation fails and we show help.
    const t = setTimeout(() => setFailed(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-3 max-w-sm px-6">
        {failed ? (
          <>
            <h1 className="text-xl font-semibold">Couldn't reach the Hyvo desktop app</h1>
            <p className="text-sm text-muted-foreground">
              Make sure Hyvo Stream Studio is open, then try signing in again from the app.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Signing you in…</h1>
            <p className="text-sm text-muted-foreground">
              Sending you back to Hyvo Stream Studio. You can close this tab once the app opens.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
