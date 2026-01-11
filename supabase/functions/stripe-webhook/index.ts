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
      logStep("Failed to send subscription email");
    }
  } catch (error) {
    logStep("Error sending subscription email");
  }
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    logStep("ERROR: No signature found in request");
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not set");
      return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 500 });
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not set");
      return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 500 });
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
        logStep("Checkout session completed", { sessionId: session.id });

        if (session.mode === "subscription" && session.customer) {
          const customerId = session.customer as string;
          const userId = session.metadata?.user_id;
          const planType = session.metadata?.plan_type;

          // Get customer email
          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;

          if (!email) {
            logStep("ERROR: No email found for customer");
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

            logStep("Creating/updating subscriber", { email, subscriptionTier });

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
              logStep("ERROR: Failed to upsert subscriber");
            } else {
              logStep("Successfully updated subscriber in database");
              const customerName = (customer as Stripe.Customer).name;
              await sendSubscriptionEmail(email, "subscription_created", subscriptionTier, subscriptionEnd, customerName || undefined);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (!email) {
          logStep("ERROR: No email found for customer");
          break;
        }

        const isActive = subscription.status === "active";
        const subscriptionEnd = isActive 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Determine tier from price
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        let subscriptionTier = null;
        if (isActive) {
          if (amount >= 3000) {
            subscriptionTier = "Year One";
          } else if (amount >= 1500) {
            subscriptionTier = "Pro";
          } else if (amount >= 500) {
            subscriptionTier = "Starter";
          }
        }

        logStep("Updating subscriber status", { email, isActive, subscriptionTier });

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
          logStep("ERROR: Failed to update subscriber");
        } else {
          logStep("Successfully updated subscriber status");
          const customerName = (customer as Stripe.Customer).name;
          await sendSubscriptionEmail(email, "subscription_updated", subscriptionTier || undefined, subscriptionEnd || undefined, customerName || undefined);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (!email) {
          logStep("ERROR: No email found for customer");
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
            payment_status: 'cancelled',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });

        if (error) {
          logStep("ERROR: Failed to update subscriber");
        } else {
          logStep("Successfully marked subscriber as unsubscribed");
          const customerName = (customer as Stripe.Customer).name;
          await sendSubscriptionEmail(email, "subscription_cancelled", undefined, undefined, customerName || undefined);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id });

        const customerId = invoice.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (!email) {
          logStep("ERROR: No email found for customer");
          break;
        }

        logStep("Marking payment as failed", { email });

        const { error } = await supabaseClient
          .from("subscribers")
          .update({
            payment_status: 'failed',
            payment_failed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);

        if (error) {
          logStep("ERROR: Failed to update payment status");
        } else {
          logStep("Successfully marked payment as failed");
          // Send payment failed notification email
          try {
            const supabaseUrl = Deno.env.get("SUPABASE_URL");
            const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
            
            if (supabaseUrl && supabaseKey) {
              await fetch(`${supabaseUrl}/functions/v1/send-subscription-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({ 
                  email, 
                  name: (customer as Stripe.Customer).name,
                  eventType: "payment_failed",
                  amount: invoice.amount_due / 100
                }),
              });
            }
          } catch (emailError) {
            logStep("Error sending payment failed email");
          }
        }
        break;
      }

      case "customer.subscription.paused": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription paused", { subscriptionId: subscription.id });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (!email) {
          logStep("ERROR: No email found for customer");
          break;
        }

        const { error } = await supabaseClient
          .from("subscribers")
          .update({
            is_paused: true,
            paused_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);

        if (error) {
          logStep("ERROR: Failed to update pause status");
        } else {
          logStep("Successfully marked subscription as paused");
        }
        break;
      }

      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription resumed", { subscriptionId: subscription.id });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;

        if (!email) {
          logStep("ERROR: No email found for customer");
          break;
        }

        const { error } = await supabaseClient
          .from("subscribers")
          .update({
            is_paused: false,
            paused_at: null,
            resume_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);

        if (error) {
          logStep("ERROR: Failed to update resume status");
        } else {
          logStep("Successfully marked subscription as resumed");
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
    logStep("ERROR processing webhook");
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 400 }
    );
  }
});
