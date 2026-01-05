import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function safeErrorResponse(error: unknown, context: string, statusCode: number = 500): Response {
  console.error(`[${context}] Error:`, error instanceof Error ? error.message : String(error));
  
  const clientMessages: Record<number, string> = {
    400: 'Invalid plan selected',
    401: 'Authentication required',
    500: 'Unable to process checkout',
  };
  
  return new Response(
    JSON.stringify({ error: clientMessages[statusCode] || 'Unable to process checkout' }),
    { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { plan } = body;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return safeErrorResponse(new Error('No auth header'), 'AUTH', 401);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      return safeErrorResponse(new Error('User not authenticated'), 'AUTH', 401);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error('[CREATE-CHECKOUT] STRIPE_SECRET_KEY not configured');
      return safeErrorResponse(new Error('Payment service not configured'), 'CONFIG', 500);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists, create if not
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('[CREATE-CHECKOUT] Using existing Stripe customer:', customerId);
    } else {
      // Create new Stripe customer to save their details
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
          created_from: 'hyvo_checkout'
        }
      });
      customerId = newCustomer.id;
      console.log('[CREATE-CHECKOUT] Created new Stripe customer:', customerId);
    }

    // Plan configuration - aligned with website pricing
    const planConfig: Record<string, { amount: number; interval: 'month' | 'year'; name: string }> = {
      starter: {
        amount: 500, // $5.00/month
        interval: "month",
        name: "Starter Monthly Subscription"
      },
      pro: {
        amount: 1500, // $15.00/month
        interval: "month",
        name: "Pro Monthly Subscription"
      },
      yearone: {
        amount: 3000, // $30.00/year  
        interval: "year",
        name: "Year One Annual Subscription"
      }
    };

    const selectedPlan = planConfig[plan];
    if (!selectedPlan) {
      return safeErrorResponse(new Error('Invalid plan'), 'VALIDATION', 400);
    }

    const getPlanLabel = (p: string) => {
      const labels: Record<string, string> = { starter: 'Starter', pro: 'Pro', yearone: 'Year One' };
      return labels[p] || p;
    };

    const origin = req.headers.get("origin") || 'https://hyvo.ai';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: selectedPlan.name,
              description: `Hyvo.ai ${getPlanLabel(plan)} subscription`
            },
            unit_amount: selectedPlan.amount,
            recurring: { interval: selectedPlan.interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      metadata: {
        user_id: user.id,
        plan_type: plan
      }
    });

    console.log('[CREATE-CHECKOUT] Session created:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return safeErrorResponse(error, 'CREATE-CHECKOUT');
  }
});
