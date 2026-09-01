/**
 * Catalog of every streaming destination Hyvo can broadcast to.
 * `oauth` platforms are linked with an account; `rtmp` platforms take an
 * ingest URL + stream key (the standard for every RTMP-capable service).
 */
export type DestinationAuth = "oauth" | "rtmp";

export interface StreamingPlatform {
  id: string;
  name: string;
  auth: DestinationAuth;
  /** Default ingest endpoint, pre-filled for the user. */
  rtmpUrl: string;
  /** Where the user finds their stream key. */
  keyHint: string;
  accent: string;
}

export const STREAMING_PLATFORMS: StreamingPlatform[] = [
  { id: "twitch", name: "Twitch", auth: "oauth", rtmpUrl: "rtmp://live.twitch.tv/app", keyHint: "Creator Dashboard → Settings → Stream", accent: "#9146FF" },
  { id: "youtube", name: "YouTube", auth: "oauth", rtmpUrl: "rtmp://a.rtmp.youtube.com/live2", keyHint: "YouTube Studio → Go Live → Stream key", accent: "#FF0033" },
  { id: "kick", name: "Kick", auth: "rtmp", rtmpUrl: "rtmps://fa723fc1b171.global-contribute.live-video.net", keyHint: "Kick Dashboard → Stream Settings", accent: "#53FC18" },
  { id: "facebook", name: "Facebook Live", auth: "rtmp", rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp", keyHint: "Facebook Live Producer → Streaming software", accent: "#1877F2" },
  { id: "tiktok", name: "TikTok Live", auth: "rtmp", rtmpUrl: "rtmp://push.live.tiktok.com/live", keyHint: "TikTok LIVE Studio → Stream key", accent: "#25F4EE" },
  { id: "instagram", name: "Instagram Live", auth: "rtmp", rtmpUrl: "rtmps://live-upload.instagram.com:443/rtmp", keyHint: "Instagram Live Producer", accent: "#E4405F" },
  { id: "x", name: "X (Twitter) Live", auth: "rtmp", rtmpUrl: "rtmp://va.pscp.tv:80/x", keyHint: "X Media Studio → Producer", accent: "#FFFFFF" },
  { id: "trovo", name: "Trovo", auth: "rtmp", rtmpUrl: "rtmp://livepush.trovo.live/live", keyHint: "Trovo Studio → Stream settings", accent: "#1FDF69" },
  { id: "rumble", name: "Rumble", auth: "rtmp", rtmpUrl: "rtmp://rtmp.rumble.com/live", keyHint: "Rumble Studio → Stream key", accent: "#85C742" },
  { id: "dlive", name: "DLive", auth: "rtmp", rtmpUrl: "rtmp://stream.dlive.tv/live", keyHint: "DLive Dashboard → Stream key", accent: "#FFD300" },
  { id: "linkedin", name: "LinkedIn Live", auth: "rtmp", rtmpUrl: "rtmps://rtmp-in.linkedin.com/live", keyHint: "LinkedIn Live event setup", accent: "#0A66C2" },
  { id: "vimeo", name: "Vimeo", auth: "rtmp", rtmpUrl: "rtmp://rtmp-global.cloud.vimeo.com/live", keyHint: "Vimeo → Create live event", accent: "#1AB7EA" },
  { id: "steam", name: "Steam Broadcast", auth: "rtmp", rtmpUrl: "rtmp://ingest.broadcast.steamcontent.com/app", keyHint: "Steam → Broadcast settings", accent: "#66C0F4" },
  { id: "odysee", name: "Odysee", auth: "rtmp", rtmpUrl: "rtmp://stream.odysee.com/live", keyHint: "Odysee → Livestream setup", accent: "#EF1970" },
  { id: "picarto", name: "Picarto", auth: "rtmp", rtmpUrl: "rtmp://live.us.picarto.tv/golive", keyHint: "Picarto → Stream settings", accent: "#1DA456" },
  { id: "custom", name: "Custom RTMP", auth: "rtmp", rtmpUrl: "", keyHint: "Any RTMP/RTMPS ingest endpoint", accent: "#22D3EE" },
];

export const getPlatform = (id: string) =>
  STREAMING_PLATFORMS.find((p) => p.id === id) ?? STREAMING_PLATFORMS[STREAMING_PLATFORMS.length - 1];
