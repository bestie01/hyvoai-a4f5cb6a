-- Fix the subscribers table to ensure proper data integrity
-- Update the trigger to use the correct function name
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();