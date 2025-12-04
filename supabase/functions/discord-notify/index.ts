import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate Discord webhook URL to prevent SSRF attacks
function validateDiscordWebhook(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow Discord webhook URLs
    if (!parsed.hostname.endsWith('discord.com') && 
        !parsed.hostname.endsWith('discordapp.com')) {
      return false;
    }
    if (!parsed.pathname.startsWith('/api/webhooks/')) {
      return false;
    }
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { webhookUrl, title, description, color, fields, thumbnail } = await req.json();

    if (!webhookUrl) {
      throw new Error('Discord webhook URL is required');
    }

    // Validate webhook URL to prevent SSRF
    if (!validateDiscordWebhook(webhookUrl)) {
      throw new Error('Invalid Discord webhook URL. Only https://discord.com/api/webhooks/ URLs are allowed.');
    }

    console.log('[DISCORD-NOTIFY] Sending notification', { title });

    const embed = {
      title: title,
      description: description,
      color: color || 0x5865F2,
      fields: fields || [],
      thumbnail: thumbnail ? { url: thumbnail } : undefined,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord API error: ${response.status} - ${errorText}`);
    }

    console.log('[DISCORD-NOTIFY] Notification sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[DISCORD-NOTIFY] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
