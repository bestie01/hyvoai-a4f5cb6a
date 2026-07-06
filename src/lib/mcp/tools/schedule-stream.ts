import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "schedule_stream",
  title: "Schedule a stream",
  description: "Create a scheduled stream on the user's Hyvo calendar.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Stream title."),
    platform: z.string().describe("Platform slug, e.g. 'twitch' or 'youtube'."),
    scheduled_start_time: z.string().describe("ISO 8601 datetime for when the stream starts."),
    duration: z.number().int().min(1).optional().describe("Planned duration in minutes."),
    description: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async ({ title, platform, scheduled_start_time, duration, description }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("stream_schedules")
      .insert({
        user_id: ctx.getUserId(),
        title,
        platform,
        scheduled_start_time,
        duration: duration ?? 60,
        description: description ?? null,
        status: "scheduled",
      } as any)
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Scheduled: ${data.title} on ${data.platform} @ ${data.scheduled_start_time}` }],
      structuredContent: { schedule: data },
    };
  },
});
