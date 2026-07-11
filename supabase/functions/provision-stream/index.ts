// Provisions RTMP ingest targets from stored OAuth tokens so users go live
// with one click — Streamlabs-style. Never returns raw stream keys to the client.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface ProvisionRequest {
  action: "provision" | "go_live" | "end_live" | "update_title";
  platforms?: ("twitch" | "youtube")[];
  title?: string;
  description?: string;
  privacy?: "public" | "unlisted" | "private";
}

async function fetchTwitchKey(accessToken: string, broadcasterId: string) {
  const clientId = Deno.env.get("TWITCH_CLIENT_ID");
  if (!clientId) throw new Error("Twitch not configured");
  const r = await fetch(
    `https://api.twitch.tv/helix/streams/key?broadcaster_id=${broadcasterId}`,
    { headers: { "Client-ID": clientId, Authorization: `Bearer ${accessToken}` } },
  );
  if (!r.ok) throw new Error(`Twitch stream_key ${r.status}: missing 'channel:read:stream_key' scope — please reconnect Twitch`);
  const data = await r.json();
  return data?.data?.[0]?.stream_key as string | undefined;
}

async function provisionYouTube(accessToken: string, title: string, privacy: string) {
  const now = new Date();
  const bRes = await fetch(
    "https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        snippet: { title: title || "Live on Hyvo", scheduledStartTime: now.toISOString() },
        status: { privacyStatus: privacy || "public", selfDeclaredMadeForKids: false },
        contentDetails: { enableAutoStart: true, enableAutoStop: true },
      }),
    },
  );
  if (!bRes.ok) throw new Error(`YouTube broadcast ${bRes.status} — reconnect Google with YouTube scopes`);
  const broadcast = await bRes.json();

  const sRes = await fetch(
    "https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,contentDetails",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        snippet: { title: title || "Hyvo Stream" },
        cdn: { frameRate: "60fps", ingestionType: "rtmp", resolution: "1080p" },
      }),
    },
  );
  if (!sRes.ok) throw new Error(`YouTube stream ${sRes.status}`);
  const stream = await sRes.json();

  await fetch(
    `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcast.id}&part=id,contentDetails&streamId=${stream.id}`,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } },
  );

  return {
    broadcastId: broadcast.id,
    streamId: stream.id,
    rtmpUrl: stream.cdn?.ingestionInfo?.ingestionAddress + "/",
    streamKey: stream.cdn?.ingestionInfo?.streamName as string,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as ProvisionRequest;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (body.action === "provision") {
      const { data: conns } = await admin
        .from("social_connections")
        .select("platform, access_token, platform_user_id, platform_username")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const wanted = new Set(body.platforms ?? ["twitch", "youtube"]);
      const results: any[] = [];

      for (const c of conns ?? []) {
        if (!wanted.has(c.platform as any)) continue;
        try {
          if (c.platform === "twitch" && c.access_token && c.platform_user_id) {
            const key = await fetchTwitchKey(c.access_token, c.platform_user_id);
            if (!key) throw new Error("Twitch returned no key");
            await admin.from("platform_streaming_configs").upsert({
              user_id: user.id,
              platform: "twitch",
              stream_key: key,
              rtmp_url: "rtmp://live.twitch.tv/app/",
              stream_title: body.title,
              is_enabled: true,
            }, { onConflict: "user_id,platform" });
            results.push({ platform: "twitch", ready: true, username: c.platform_username });
          } else if (c.platform === "youtube" && c.access_token) {
            const yt = await provisionYouTube(c.access_token, body.title ?? "Live on Hyvo", body.privacy ?? "public");
            await admin.from("platform_streaming_configs").upsert({
              user_id: user.id,
              platform: "youtube",
              stream_key: yt.streamKey,
              rtmp_url: yt.rtmpUrl,
              stream_title: body.title,
              stream_description: body.description,
              is_enabled: true,
            }, { onConflict: "user_id,platform" });
            results.push({ platform: "youtube", ready: true, username: c.platform_username, broadcastId: yt.broadcastId });
          }
        } catch (err) {
          results.push({ platform: c.platform, ready: false, error: (err as Error).message });
        }
      }

      if (results.length === 0) {
        return json({ ok: false, error: "No connected platforms. Connect Twitch or YouTube first." }, 400);
      }
      return json({ ok: true, platforms: results });
    }

    if (body.action === "go_live") {
      const { data: stream, error } = await admin
        .from("streams")
        .insert({ user_id: user.id, is_live: true })
        .select()
        .single();
      if (error) throw error;
      return json({ ok: true, streamId: stream.id });
    }

    if (body.action === "end_live") {
      await admin.from("streams").update({ is_live: false }).eq("user_id", user.id).eq("is_live", true);
      return json({ ok: true });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err) {
    console.error("[provision-stream]", err);
    return json({ error: (err as Error).message || "Unknown error" }, 500);
  }
});
