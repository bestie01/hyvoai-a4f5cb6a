import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Helper function to send subscription email
const sendSubscriptionEmail = async (
  email: string, 
  eventType: "subscription_created" | "subscription_updated" | "subscription_cancelled",
  tier?: string,
  endDate?: string,
  name?: string
) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      logStep("Missing Supabase credentials for email notification");
      return;
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-subscription-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ email, name, eventType, tier, endDate }),
    });
    
    if (response.ok) {
      logStep("Subscription email sent", { email, eventType });
    } else {
      const errorText = await response.text();
      logStep("Failed to send subscription email", { error: errorText });
    }
  } catch (error) {
    logStep("Error sending subscription email", { error: (error as Error).message });
  }
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    logStep("ERROR: No signature found in request");
    return new Response(JSON.stringify({ error: "No signature" }), { status: 400 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET is not set - webhook verification required");
      throw new Error("STRIPE_WEBHOOK_SECRET is required for webhook verification");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    
    // Always verify webhook signature - no exceptions for security
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook signature verified", { eventType: event.type });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          metadata: session.metadata 
        });

        if (session.mode === "subscription" && session.customer) {
          const customerId = session.customer as string;
          const userId = session.metadata?.user_id;
          const planType = session.metadata?.plan_type;

          // Get customer email
          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;

          if (!email) {
            logStep("ERROR: No email found for customer", { customerId });
            break;
          }

          // Get subscription details
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: "active",
            limit: 1,
          });

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            
            // Determine tier
            let subscriptionTier = planType === 'yearone' ? 'Year One' : 'Pro';

            logStep("Creating/updating subscriber", { 
              email, 
              userId, 
              subscriptionTier,
              subscriptionEnd 
            });

            const { error } = await supabaseClient
              .from("subscribers")
              .upsert({
                email,
                user_id: userId || null,
                stripe_customer_id: customerId,
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: subscriptionEnd,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'email' });

            if (error) {
              logStep("ERROR: Failed to upsert subscriber", { error: error.message });
            } else {
              logStep("Successfully updated subscriber in database");
              
              // Send welcome email
              const customerName = (customer as Stripe.Customer).name;
              await sendSubscriptionEmail(email, "subscription_created", subscriptionTier, subscriptionEnd, customerName || undefined);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { 
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer 
        });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (!email) {
          logStep("ERROR: No email found for customer", { customerId });
          break;
        }

        const isActive = subscription.status === "active";
        const subscriptionEnd = isActive 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Determine tier from price - Updated for new pricing
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        let subscriptionTier = null;
        if (isActive) {
          if (amount >= 3000) { // $30 or more = Year One
            subscriptionTier = "Year One";
          } else if (amount >= 1500) { // $15 or more = Pro
            subscriptionTier = "Pro";
          }
        }

        logStep("Updating subscriber status", { 
          email, 
          isActive, 
          subscriptionTier,
          subscriptionEnd 
        });

        const { error } = await supabaseClient
          .from("subscribers")
          .upsert({
            email,
            stripe_customer_id: customerId,
            subscribed: isActive,
            subscription_tier: subscriptionTier,
            subscription_end: subscriptionEnd,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });

        if (error) {
          logStep("ERROR: Failed to update subscriber", { error: error.message });
        } else {
          logStep("Successfully updated subscriber status");
          
          // Send update email
          const customerName = (customer as Stripe.Customer).name;
          await sendSubscriptionEmail(email, "subscription_updated", subscriptionTier || undefined, subscriptionEnd || undefined, customerName || undefined);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer 
        });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (!email) {
          logStep("ERROR: No email found for customer", { customerId });
          break;
        }

        logStep("Marking subscriber as unsubscribed", { email });

        const { error } = await supabaseClient
          .from("subscribers")
          .upsert({
            email,
            stripe_customer_id: customerId,
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });

        if (error) {
          logStep("ERROR: Failed to update subscriber", { error: error.message });
        } else {
          logStep("Successfully marked subscriber as unsubscribed");
          
          // Send cancellation email
          const customerName = (customer as Stripe.Customer).name;
          await sendSubscriptionEmail(email, "subscription_cancelled", undefined, undefined, customerName || undefined);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing webhook", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400 }
    );
  }
});
