-- Phase 1: Social Media Connections & Platform Configs
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'discord', 'instagram', 'tiktok', 'facebook', 'youtube')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT,
  platform_username TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own social connections"
ON public.social_connections
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Platform Streaming Configurations for Multi-Streaming
CREATE TABLE public.platform_streaming_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitch', 'youtube', 'facebook', 'kick', 'tiktok')),
  stream_key TEXT NOT NULL,
  rtmp_url TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  stream_title TEXT,
  stream_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_streaming_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own streaming configs"
ON public.platform_streaming_configs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Stream Scenes for Scene Management
CREATE TABLE public.stream_scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT false,
  hotkey TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stream_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scenes"
ON public.stream_scenes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Chat Commands for Bot
CREATE TABLE public.chat_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command TEXT NOT NULL,
  response TEXT NOT NULL,
  cooldown INTEGER DEFAULT 0,
  permission_level TEXT DEFAULT 'everyone' CHECK (permission_level IN ('everyone', 'subscriber', 'vip', 'moderator', 'broadcaster')),
  is_enabled BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, command)
);

ALTER TABLE public.chat_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat commands"
ON public.chat_commands
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Banned Words for Moderation
CREATE TABLE public.banned_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  is_regex BOOLEAN DEFAULT false,
  action TEXT DEFAULT 'timeout' CHECK (action IN ('delete', 'timeout', 'ban')),
  timeout_duration INTEGER DEFAULT 600,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, word)
);

ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their banned words"
ON public.banned_words
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- VIP Users
CREATE TABLE public.vip_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vip_username TEXT NOT NULL,
  vip_platform TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, vip_username, vip_platform)
);

ALTER TABLE public.vip_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their VIP users"
ON public.vip_users
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Community Events
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('tournament', 'giveaway', 'collab', 'special_stream', 'meetup', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public events"
ON public.community_events
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
ON public.community_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
ON public.community_events
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
ON public.community_events
FOR DELETE
USING (auth.uid() = user_id);

-- Fan Content Showcase
CREATE TABLE public.fan_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fan_username TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('fanart', 'clip', 'meme', 'cosplay', 'other')),
  content_url TEXT NOT NULL,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fan_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fan content"
ON public.fan_content
FOR SELECT
USING (true);

CREATE POLICY "Streamers can insert fan content"
ON public.fan_content
FOR INSERT
WITH CHECK (auth.uid() = streamer_id);

CREATE POLICY "Streamers can update their fan content"
ON public.fan_content
FOR UPDATE
USING (auth.uid() = streamer_id)
WITH CHECK (auth.uid() = streamer_id);

CREATE POLICY "Streamers can delete their fan content"
ON public.fan_content
FOR DELETE
USING (auth.uid() = streamer_id);

-- Referrals System
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_amount INTEGER DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referrer_id);

-- Stream Health Metrics
CREATE TABLE public.stream_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,
  bitrate INTEGER,
  fps INTEGER,
  dropped_frames INTEGER DEFAULT 0,
  network_latency INTEGER,
  cpu_usage NUMERIC(5,2),
  memory_usage NUMERIC(5,2),
  connection_quality TEXT CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stream_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their stream health metrics"
ON public.stream_health_metrics
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Scheduled Posts for Social Media Automation
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'discord', 'instagram', 'tiktok', 'facebook')),
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'cancelled')),
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their scheduled posts"
ON public.scheduled_posts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update triggers for updated_at
CREATE TRIGGER update_social_connections_updated_at
BEFORE UPDATE ON public.social_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_streaming_configs_updated_at
BEFORE UPDATE ON public.platform_streaming_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stream_scenes_updated_at
BEFORE UPDATE ON public.stream_scenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_commands_updated_at
BEFORE UPDATE ON public.chat_commands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
BEFORE UPDATE ON public.community_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();