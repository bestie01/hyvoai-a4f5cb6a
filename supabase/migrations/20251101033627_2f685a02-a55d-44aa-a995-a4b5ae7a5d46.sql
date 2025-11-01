-- Fix Critical Security Issues (Corrected)

-- 1. Add RLS policies to streams table
CREATE POLICY "Users can view their own streams"
ON public.streams
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streams"
ON public.streams
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams"
ON public.streams
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streams"
ON public.streams
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Fix poll voting - add unique constraint using voter_identifier
ALTER TABLE poll_votes
ADD CONSTRAINT unique_voter_poll_vote UNIQUE (poll_id, voter_identifier);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_voter ON poll_votes(poll_id, voter_identifier);

-- 3. Secure donations table - make email not nullable and add validation
ALTER TABLE donations
ALTER COLUMN donor_email SET NOT NULL;

-- Add constraint to validate email format
ALTER TABLE donations
ADD CONSTRAINT valid_email_format CHECK (donor_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 4. Add missing RLS policies to referrals table
CREATE POLICY "Users can update their own referrals"
ON public.referrals
FOR UPDATE
USING (auth.uid() = referrer_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stream_analytics_user_timestamp ON stream_analytics(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stream_analytics_platform ON stream_analytics(platform);