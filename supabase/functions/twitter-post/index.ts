import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, API_SECRET!, ACCESS_TOKEN_SECRET!);
  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };
  const entries = Object.entries(signedOAuthParams).sort((a, b) => a[0].localeCompare(b[0]));

  return "OAuth " + entries.map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`).join(", ");
}

async function postTweet(text: string, mediaIds?: string[]): Promise<any> {
  const url = "https://api.x.com/2/tweets";
  const method = "POST";
  const body: any = { text };
  if (mediaIds && mediaIds.length > 0) {
    body.media = { media_ids: mediaIds };
  }

  const oauthHeader = generateOAuthHeader(method, url);
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${text}`);
  }

  return await response.json();
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

    const { text, mediaIds, scheduled } = await req.json();

    if (scheduled) {
      // Schedule the post
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          platform: 'twitter',
          content: text,
          media_urls: mediaIds || [],
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
      // Post immediately
      if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
        throw new Error('Twitter API credentials not configured');
      }

      const result = await postTweet(text, mediaIds);

      return new Response(
        JSON.stringify({ success: true, tweet: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error posting tweet:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});