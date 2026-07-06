import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "generate_stream_title",
  title: "Generate stream titles",
  description: "Generate catchy, click-worthy stream title ideas for a given game and vibe using Hyvo AI.",
  inputSchema: {
    game: z.string().describe("Game or content category, e.g. 'Valorant'."),
    mood: z.string().optional().describe("Vibe/mood, e.g. 'hype', 'chill', 'chaotic'."),
    count: z.number().int().min(1).max(10).optional().describe("How many titles (default 5)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ game, mood, count }, ctx: ToolContext) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { content: [{ type: "text", text: "LOVABLE_API_KEY not configured" }], isError: true };
    const n = count ?? 5;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You generate short, punchy Twitch/YouTube live stream titles. Return one per line, no numbering." },
          { role: "user", content: `Game/topic: ${game}\nMood: ${mood ?? "hype"}\nGenerate ${n} titles.` },
        ],
      }),
    });
    if (!res.ok) return { content: [{ type: "text", text: `AI gateway error: ${res.status}` }], isError: true };
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const titles = text.split("\n").map((s: string) => s.trim()).filter(Boolean).slice(0, n);
    return {
      content: [{ type: "text", text: titles.join("\n") }],
      structuredContent: { titles },
    };
  },
});
