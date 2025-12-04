import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { webhookUrl, content, embeds, scheduled } = await req.json();

    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    // Validate webhook URL to prevent SSRF
    if (!validateDiscordWebhook(webhookUrl)) {
      throw new Error('Invalid Discord webhook URL. Only https://discord.com/api/webhooks/ URLs are allowed.');
    }

    if (scheduled) {
      // Schedule the post
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          platform: 'discord',
          content: JSON.stringify({ content, embeds, webhookUrl }),
          scheduled_time: scheduled,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, scheduled: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Send immediately
      const body: any = {};
      if (content) body.content = content;
      if (embeds && embeds.length > 0) body.embeds = embeds;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Discord webhook error: ${response.status} - ${text}`);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error sending Discord webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});