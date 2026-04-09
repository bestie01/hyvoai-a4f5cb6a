
-- Drop old check constraint
ALTER TABLE public.social_connections DROP CONSTRAINT IF EXISTS social_connections_platform_check;

-- Add new check constraint with twitch included
ALTER TABLE public.social_connections ADD CONSTRAINT social_connections_platform_check 
  CHECK (platform = ANY (ARRAY['twitter'::text, 'discord'::text, 'instagram'::text, 'tiktok'::text, 'facebook'::text, 'youtube'::text, 'twitch'::text]));

-- Normalize any old 'google' rows to 'youtube'
UPDATE public.social_connections SET platform = 'youtube' WHERE platform = 'google';
