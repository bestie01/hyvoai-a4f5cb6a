import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listStreams from "./tools/list-streams";
import getAnalytics from "./tools/get-analytics";
import scheduleStream from "./tools/schedule-stream";
import listSchedule from "./tools/list-schedule";
import generateTitle from "./tools/generate-title";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hyvo-mcp",
  title: "Hyvo.ai Streaming Assistant",
  version: "0.1.0",
  instructions:
    "Tools for Hyvo.ai — the AI-powered live streaming assistant. Use these to list a streamer's streams, view analytics, manage their schedule, and generate stream titles.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listStreams, getAnalytics, scheduleStream, listSchedule, generateTitle],
});
