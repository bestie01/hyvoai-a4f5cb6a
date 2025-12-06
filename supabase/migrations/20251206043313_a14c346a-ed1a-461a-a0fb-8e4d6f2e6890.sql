-- Fix poll votes privacy: Only allow poll owners to see votes
DROP POLICY IF EXISTS "Users can view votes on polls" ON public.poll_votes;

CREATE POLICY "Poll owners can view votes on their polls" 
ON public.poll_votes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.stream_polls 
    WHERE stream_polls.id = poll_votes.poll_id 
    AND stream_polls.user_id = auth.uid()
  )
);