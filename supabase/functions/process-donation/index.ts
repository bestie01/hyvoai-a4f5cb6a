import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized - valid authentication required');
    }

    const { amount, currency, donorName, donorEmail, message, streamerId, streamId } = await req.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required');
    }

    if (!streamerId) {
      throw new Error('Streamer ID is required');
    }

    // Validate amount is reasonable (between $1 and $10000)
    if (amount < 100 || amount > 1000000) {
      throw new Error('Amount must be between $1 and $10,000');
    }

    console.log('[PROCESS-DONATION] Creating payment intent', { 
      amount, 
      currency, 
      donorId: user.id,
      streamerId 
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'usd',
      metadata: {
        donor_name: donorName || user.email || 'Anonymous',
        donor_email: donorEmail || user.email || '',
        donor_user_id: user.id, // Authenticated donor
        streamer_id: streamerId, // Recipient streamer
        stream_id: streamId || '',
      },
    });

    const { error: dbError } = await supabase
      .from('donations')
      .insert([{
        user_id: streamerId, // The streamer receiving the donation
        stream_id: streamId || null,
        donor_name: donorName || user.email || 'Anonymous',
        donor_email: donorEmail || user.email || '',
        amount: amount,
        currency: currency || 'usd',
        message: message || null,
        stripe_payment_intent: paymentIntent.id,
      }]);

    if (dbError) {
      console.error('[PROCESS-DONATION] Database error:', dbError);
      // Don't fail the request - payment intent was created successfully
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[PROCESS-DONATION] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
