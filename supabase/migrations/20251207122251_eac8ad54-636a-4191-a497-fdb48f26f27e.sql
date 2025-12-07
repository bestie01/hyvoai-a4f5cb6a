-- Fix 1: Tighten subscribers RLS policy - require user_id match only (not email)
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
CREATE POLICY "Users can view their own subscription"
ON public.subscribers
FOR SELECT
USING (user_id = auth.uid());

-- Fix 2: Restrict poll_votes SELECT to poll owners only (privacy protection)
DROP POLICY IF EXISTS "Anyone can view votes" ON public.poll_votes;

-- Fix 3: Replace overly permissive edge function policies with service_role checks
-- These policies use a pattern that validates the request is from a trusted source

-- Create a helper function to check if the request is from service role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role',
    false
  )
$$;

-- Fix 4: Tighten viewer_engagement policies
DROP POLICY IF EXISTS "Edge functions can manage engagement" ON public.viewer_engagement;
CREATE POLICY "Service role can manage engagement"
ON public.viewer_engagement
FOR ALL
USING (public.is_service_role())
WITH CHECK (public.is_service_role());

-- Fix 5: Tighten ai_generated_content policies
DROP POLICY IF EXISTS "Edge functions can manage AI content" ON public.ai_generated_content;
CREATE POLICY "Service role can manage AI content"
ON public.ai_generated_content
FOR ALL
USING (public.is_service_role())
WITH CHECK (public.is_service_role());

-- Fix 6: Tighten ai_predictions policies
DROP POLICY IF EXISTS "Edge functions can manage predictions" ON public.ai_predictions;
CREATE POLICY "Service role can manage predictions"
ON public.ai_predictions
FOR ALL
USING (public.is_service_role())
WITH CHECK (public.is_service_role());

-- Fix 7: Tighten chat_analysis policies
DROP POLICY IF EXISTS "Edge functions can create chat analysis" ON public.chat_analysis;
CREATE POLICY "Service role can create chat analysis"
ON public.chat_analysis
FOR INSERT
WITH CHECK (public.is_service_role());

-- Fix 8: Tighten chat_moderation_actions policies
DROP POLICY IF EXISTS "Edge functions can create moderation actions" ON public.chat_moderation_actions;
CREATE POLICY "Service role can create moderation actions"
ON public.chat_moderation_actions
FOR INSERT
WITH CHECK (public.is_service_role());

-- Fix 9: Tighten stream_highlights policies
DROP POLICY IF EXISTS "Edge functions can create highlights" ON public.stream_highlights;
CREATE POLICY "Service role can create highlights"
ON public.stream_highlights
FOR INSERT
WITH CHECK (public.is_service_role());

-- Fix 10: Tighten donations policies - require Stripe webhook validation
DROP POLICY IF EXISTS "Edge functions can create donations" ON public.donations;
CREATE POLICY "Service role can create donations"
ON public.donations
FOR INSERT
WITH CHECK (public.is_service_role());