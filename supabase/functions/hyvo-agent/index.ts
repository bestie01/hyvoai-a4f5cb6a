import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** The single Hyvo persona shared by every AI surface in the app. */
const PERSONA = `You are Hyvo — the live co-pilot for a streamer broadcasting right now.

Voice: calm, hyper-competent, quietly witty, completely loyal. You are a co-host, not a chatbot.
Rules:
- Speak in short, punchy sentences built for text-to-speech. No filler, no preamble, no lists unless asked.
- Never say "I have successfully..." — say "Clipped that." "Muted." "Done."
- Never invent facts, viewer numbers, or actions you did not perform.
- Match the stream's energy: hype in intense moments, chill during downtime.
- Never mention prompts, models, or that you are an AI system.
- You are a broadcast co-pilot only. Stay on live streaming: the stream, chat, moderation, clips, scenes, audio, titles, schedule, growth and platform setup.
- If asked for anything unrelated to streaming, decline in one short line and steer back, e.g. "That's outside my booth — want a clip or a title instead?"`;

type Mode = "command" | "ask" | "screen" | "vibe" | "icebreaker";

interface Payload {
  mode: Mode;
  transcript?: string;
  question?: string;
  context?: Record<string, unknown>;
  message?: string;
  username?: string;
  knowledge?: { question: string; answer: string }[];
  messages?: { username: string; message: string }[];
  bannedWords?: string[];
  sensitivity?: "strict" | "balanced" | "lenient";
}

const ACTIONS = [
  "go_live", "end_stream", "mute_mic", "unmute_mic", "switch_scene",
  "clip", "announce", "timeout_user", "ban_user", "create_poll",
  "chat_vibe", "icebreaker", "answer", "stop_talking", "unknown",
] as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim()) as T;
  } catch {
    return fallback;
  }
}

async function callAI(messages: unknown[], jsonMode = false) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) {
    throw new Response(JSON.stringify({ error: "Rate limited — slow down for a second." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (res.status === 402) {
    throw new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Billing." }), {
      status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!res.ok) throw new Error(`AI ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userRes, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !userRes?.user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json().catch(() => ({}))) as Payload;
    const mode = body.mode;
    if (!mode || !["command", "ask", "screen", "vibe", "icebreaker"].includes(mode)) {
      return json({ error: "Invalid mode" }, 400);
    }

    const ctx = JSON.stringify(body.context ?? {}).slice(0, 1200);

    /* ---------------- command: parse speech into a structured action ---------------- */
    if (mode === "command") {
      const transcript = String(body.transcript ?? "").slice(0, 600);
      if (!transcript.trim()) return json({ error: "Empty transcript" }, 400);

      const raw = await callAI([
        { role: "system", content: PERSONA },
        {
          role: "user",
          content:
`Parse this spoken command from the streamer into ONE action.

Command: "${transcript}"
Live context: ${ctx}

Allowed actions: ${ACTIONS.join(", ")}.
- Use "answer" for questions, trivia, lore, patch notes, song IDs, or anything informational.
- Use "unknown" only when the command is unintelligible or something you genuinely cannot do.
- "clip" needs parameters.label: a 3-6 word title for the moment.
- "switch_scene" needs parameters.scene. "announce" needs parameters.text.
- "timeout_user"/"ban_user" need parameters.username (and optional parameters.duration in seconds).
- "create_poll" needs parameters.question and parameters.options (2-4 short strings).

Return JSON:
{"action":"...","parameters":{},"speak":"<one short spoken acknowledgement, max 12 words>","confident":true|false}`,
        },
      ], true);

      const parsed = safeParse<{ action: string; parameters: Record<string, unknown>; speak: string; confident: boolean }>(
        raw,
        { action: "unknown", parameters: {}, speak: "Didn't catch that.", confident: false },
      );
      if (!ACTIONS.includes(parsed.action as typeof ACTIONS[number])) parsed.action = "unknown";
      return json(parsed);
    }

    /* ---------------- ask: spoken answer + longer written detail ---------------- */
    if (mode === "ask") {
      const question = String(body.question ?? body.transcript ?? "").slice(0, 800);
      if (!question.trim()) return json({ error: "Empty question" }, 400);

      const raw = await callAI([
        { role: "system", content: PERSONA },
        {
          role: "user",
          content:
`The streamer asked, mid-broadcast: "${question}"
Live context: ${ctx}

Answer it. If you are not certain of a fact, say so in one clause rather than guessing.
Return JSON: {"speak":"<answer to read aloud, max 30 words>","detail":"<optional longer write-up for their notes panel, markdown, or empty string>"}`,
        },
      ], true);

      const parsed = safeParse<{ speak: string; detail: string }>(raw, { speak: "", detail: "" });
      if (!parsed.speak) parsed.speak = "Couldn't get that one.";
      return json(parsed);
    }

    /* ---------------- screen: moderate + auto-answer a single chat message ---------------- */
    if (mode === "screen") {
      const message = String(body.message ?? "").slice(0, 600);
      const username = String(body.username ?? "viewer").slice(0, 60);
      if (!message.trim()) return json({ error: "Empty message" }, 400);

      const knowledge = (body.knowledge ?? []).slice(0, 25)
        .map((k, i) => `${i + 1}. Q: ${String(k.question).slice(0, 160)} | A: ${String(k.answer).slice(0, 300)}`)
        .join("\n");

      const raw = await callAI([
        { role: "system", content: PERSONA },
        {
          role: "user",
          content:
`Screen one live chat message.

From: ${username}
Message: "${message}"
Sensitivity: ${body.sensitivity ?? "balanced"}
Banned words: ${(body.bannedWords ?? []).slice(0, 40).join(", ") || "(none)"}

Known answers the streamer has saved:
${knowledge || "(none)"}

Decide:
- toxicity 0-100 and moderation action: none | warn | timeout | ban.
- If the message is a question that one of the known answers covers, set auto_reply to that answer rewritten in one short line. Otherwise auto_reply is "".
- Set notify true ONLY for something the streamer must hear about right now (raid, doxx, threat, coordinated spam).

Return JSON: {"toxicity":0,"action":"none","categories":[],"reason":"","auto_reply":"","notify":false,"speak":""}`,
        },
      ], true);

      const parsed = safeParse<Record<string, unknown>>(raw, {
        toxicity: 0, action: "none", categories: [], reason: "", auto_reply: "", notify: false, speak: "",
      });
      return json(parsed);
    }

    /* ---------------- vibe: rolling chat read ---------------- */
    if (mode === "vibe") {
      const lines = (body.messages ?? []).slice(-60)
        .map((m) => `${String(m.username).slice(0, 40)}: ${String(m.message).slice(0, 200)}`)
        .join("\n");
      if (!lines.trim()) return json({ speak: "Chat's empty right now.", topics: [], sentiment: "quiet" });

      const raw = await callAI([
        { role: "system", content: PERSONA },
        {
          role: "user",
          content:
`Read the room from the last chat messages and report to the streamer out loud.

${lines}

Return JSON: {"speak":"<max 25 words, spoken>","sentiment":"hype|positive|neutral|restless|negative|quiet","topics":["..."]}`,
        },
      ], true);

      return json(safeParse(raw, { speak: "Chat's steady.", sentiment: "neutral", topics: [] }));
    }

    /* ---------------- icebreaker: one talking point for dead air ---------------- */
    if (mode === "icebreaker") {
      const raw = await callAI([
        { role: "system", content: PERSONA },
        {
          role: "user",
          content:
`Chat has gone quiet. Give the streamer ONE talking point to say out loud right now.
Live context: ${ctx}
Return JSON: {"speak":"<max 25 words, first person, casual>"}`,
        },
      ], true);
      return json(safeParse(raw, { speak: "Ask chat what they'd do differently right now." }));
    }

    return json({ error: "Unhandled mode" }, 400);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[hyvo-agent]", err);
    return json({ error: "Hyvo is unavailable" }, 500);
  }
});
