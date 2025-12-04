-- Fix critical security vulnerability: Subscribers table overly permissive RLS policies
-- This prevents attackers from granting themselves free premium subscriptions

-- Drop the dangerous policies that allow anyone to INSERT/UPDATE
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Keep the existing SELECT policy (select_own_subscription) which is already secure
-- Users can only view their own subscription based on user_id or email

-- Note: The stripe-webhook edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- so it will continue to work correctly for managing subscriptions after payment processing.