import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCTION_RETURN_URL = "https://hyvoai.lovable.app/subscription";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

const jsonError = (message: string, code: string, status = 500) =>
  new Response(JSON.stringify({ error: message, code }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return jsonError("Stripe key not configured", "missing_stripe_key");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonError("Not authenticated", "no_auth_header", 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      return jsonError("Authentication failed", "auth_failed", 401);
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // 1) Prefer stripe_customer_id stored in subscribers table.
    let customerId: string | null = null;
    const { data: subRow } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subRow?.stripe_customer_id) {
      customerId = subRow.stripe_customer_id;
      logStep("Found customer in subscribers table", { customerId });
    }

    // 2) Fall back to Stripe email lookup.
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found Stripe customer by email", { customerId });
      }
    }

    // 3) Create a customer if still none — Portal needs an existing customer.
    if (!customerId) {
      const created = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = created.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Persist customer id for next time.
    await supabaseClient
      .from("subscribers")
      .upsert(
        { user_id: user.id, email: user.email, stripe_customer_id: customerId },
        { onConflict: "user_id" }
      );

    // Always use production return URL unless request comes from a real lovable host.
    const reqOrigin = req.headers.get("origin") || "";
    const isLovableOrigin = /^https:\/\/[^/]+\.lovable\.app$/.test(reqOrigin);
    const returnUrl = isLovableOrigin ? `${reqOrigin}/subscription` : PRODUCTION_RETURN_URL;

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      logStep("Portal session created", { sessionId: portalSession.id });
      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeErr: any) {
      const msg = stripeErr?.message || String(stripeErr);
      logStep("Stripe portal error", { message: msg });
      // Common cause: no Billing Portal configuration set in Stripe dashboard.
      if (msg.toLowerCase().includes("no configuration")) {
        return jsonError(
          "Stripe Customer Portal isn't configured yet. Open Stripe Dashboard → Settings → Billing → Customer portal and click Save.",
          "portal_not_configured"
        );
      }
      return jsonError(msg, "stripe_error");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return jsonError(errorMessage, "unhandled");
  }
});
