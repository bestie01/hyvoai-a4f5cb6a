-- Fix poll_votes security: require authentication and prevent vote manipulation

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Anyone can create votes" ON public.poll_votes;

-- Create a unique constraint to prevent duplicate votes
ALTER TABLE public.poll_votes 
  DROP CONSTRAINT IF EXISTS unique_poll_voter;
  
ALTER TABLE public.poll_votes 
  ADD CONSTRAINT unique_poll_voter UNIQUE (poll_id, voter_identifier);

-- Require authentication for voting and enforce one vote per user per poll
CREATE POLICY "Authenticated users can vote once"
  ON public.poll_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    voter_identifier = auth.uid()::text
    AND NOT EXISTS (
      SELECT 1 FROM public.poll_votes pv
      WHERE pv.poll_id = poll_votes.poll_id
        AND pv.voter_identifier = auth.uid()::text
    )
  );