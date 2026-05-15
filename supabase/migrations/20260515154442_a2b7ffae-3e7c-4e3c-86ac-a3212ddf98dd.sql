
-- 1. Tighten referrals UPDATE: prevent self-approval and reward manipulation
DROP POLICY IF EXISTS "Users can update their own referrals" ON public.referrals;

CREATE POLICY "Users can update their own referrals"
ON public.referrals
FOR UPDATE
TO authenticated
USING (auth.uid() = referrer_id)
WITH CHECK (auth.uid() = referrer_id);

-- Attach the existing validate_referral_update trigger so column-level
-- restrictions (reward_amount immutable, reward_claimed only by service_role)
-- are actually enforced.
DROP TRIGGER IF EXISTS referrals_validate_update ON public.referrals;
CREATE TRIGGER referrals_validate_update
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.validate_referral_update();

-- 2. Hide donor_email from streamers (column-level revoke).
-- Edge functions using the service_role key are unaffected.
REVOKE SELECT (donor_email) ON public.donations FROM anon, authenticated;

-- 3. Revoke API access to the foreign table that bypasses RLS.
REVOKE ALL ON TABLE public."2" FROM anon, authenticated;
