-- Add fraud protection to referrals table

-- 1. Create validation trigger to prevent reward field manipulation
CREATE OR REPLACE FUNCTION public.validate_referral_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modification of reward_amount by non-service-role users
  IF NEW.reward_amount != OLD.reward_amount THEN
    RAISE EXCEPTION 'Cannot modify reward_amount field';
  END IF;
  
  -- Only service_role can mark rewards as claimed
  IF NEW.reward_claimed = true AND OLD.reward_claimed = false THEN
    -- Check if this is a service_role request (from edge functions/webhooks)
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
      IF (current_setting('request.jwt.claims', true)::json->>'role') != 'service_role' THEN
        RAISE EXCEPTION 'Only system can mark rewards as claimed';
      END IF;
    END IF;
  END IF;
  
  -- Prevent unclaiming rewards (setting claimed back to false)
  IF NEW.reward_claimed = false AND OLD.reward_claimed = true THEN
    RAISE EXCEPTION 'Cannot unclaim rewards';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create the trigger on referrals table
DROP TRIGGER IF EXISTS validate_referral_update_trigger ON public.referrals;
CREATE TRIGGER validate_referral_update_trigger
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_referral_update();

-- 3. Add controlled DELETE policy for unused referral codes
-- Users can only delete their own pending referrals that haven't been used
CREATE POLICY "Users can delete unused referrals"
  ON public.referrals
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = referrer_id
    AND status = 'pending'
    AND referred_user_id IS NULL
    AND reward_claimed = false
  );