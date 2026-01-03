import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name?: string;
  eventType: "subscription_created" | "subscription_updated" | "subscription_cancelled";
  tier?: string;
  endDate?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SUBSCRIPTION-EMAIL] ${step}${detailsStr}`);
};

const getEmailContent = (eventType: string, name: string, tier?: string, endDate?: string) => {
  const userName = name || "Valued Customer";
  
  switch (eventType) {
    case "subscription_created":
      return {
        subject: `Welcome to Hyvo.ai ${tier} - Your Subscription is Active!`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0f0f14, #1a1a24); color: #fff; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: #fff;">Welcome to Hyvo.ai! 🎉</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #e0e0e0;">Hey ${userName},</p>
              <p style="font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Your <strong style="color: #a855f7;">${tier}</strong> subscription is now active! You now have access to all premium features including:
              </p>
              <ul style="color: #b0b0b0; line-height: 2;">
                <li>✨ AI-powered stream titles and thumbnails</li>
                <li>📊 Advanced analytics dashboard</li>
                <li>🎮 Multi-platform streaming</li>
                <li>🤖 AI chat moderation</li>
                <li>📈 Growth tools and insights</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://hyvo.ai/studio" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  Start Streaming
                </a>
              </div>
              <p style="font-size: 14px; color: #888;">
                Need help? Reply to this email or visit our community.
              </p>
            </div>
            <div style="background: #111118; padding: 20px 30px; text-align: center; border-top: 1px solid #2a2a35;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2026 Hyvo.ai - AI-Powered Streaming Platform
              </p>
            </div>
          </div>
        `
      };
    
    case "subscription_updated":
      return {
        subject: `Your Hyvo.ai Subscription Has Been Updated`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0f0f14, #1a1a24); color: #fff; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: #fff;">Subscription Updated 📝</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #e0e0e0;">Hey ${userName},</p>
              <p style="font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Your subscription has been updated. Your current plan is <strong style="color: #a855f7;">${tier || "Pro"}</strong>.
              </p>
              ${endDate ? `<p style="font-size: 14px; color: #888;">Next billing date: ${new Date(endDate).toLocaleDateString()}</p>` : ''}
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://hyvo.ai/profile" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  Manage Subscription
                </a>
              </div>
            </div>
            <div style="background: #111118; padding: 20px 30px; text-align: center; border-top: 1px solid #2a2a35;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2026 Hyvo.ai - AI-Powered Streaming Platform
              </p>
            </div>
          </div>
        `
      };
    
    case "subscription_cancelled":
      return {
        subject: `We're Sorry to See You Go - Hyvo.ai`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0f0f14, #1a1a24); color: #fff; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #666, #888); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: #fff;">Subscription Cancelled 👋</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #e0e0e0;">Hey ${userName},</p>
              <p style="font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                We're sorry to see you go. Your subscription has been cancelled and you'll have access until the end of your billing period.
              </p>
              <p style="font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                If you change your mind, you can always resubscribe to continue using all the premium features.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://hyvo.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  Resubscribe
                </a>
              </div>
              <p style="font-size: 14px; color: #888;">
                We'd love to hear your feedback! Reply to this email to let us know how we can improve.
              </p>
            </div>
            <div style="background: #111118; padding: 20px 30px; text-align: center; border-top: 1px solid #2a2a35;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2026 Hyvo.ai - AI-Powered Streaming Platform
              </p>
            </div>
          </div>
        `
      };
    
    default:
      return {
        subject: "Hyvo.ai Subscription Update",
        html: `<p>Your subscription has been updated.</p>`
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, eventType, tier, endDate }: EmailRequest = await req.json();
    
    logStep("Sending subscription email", { email, eventType, tier });
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    const { subject, html } = getEmailContent(eventType, name || "", tier, endDate);
    
    const emailResponse = await resend.emails.send({
      from: "Hyvo.ai <noreply@hyvo.ai>",
      to: [email],
      subject,
      html,
    });
    
    logStep("Email sent successfully", emailResponse);
    
    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("Error sending email", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
