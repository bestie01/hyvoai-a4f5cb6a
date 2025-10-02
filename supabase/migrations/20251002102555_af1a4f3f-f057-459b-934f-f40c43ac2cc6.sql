-- Create stream schedules table
CREATE TABLE IF NOT EXISTS public.stream_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('twitch', 'youtube')),
  scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stream clips table
CREATE TABLE IF NOT EXISTS public.stream_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  duration INTEGER, -- duration in seconds
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stream VODs table
CREATE TABLE IF NOT EXISTS public.stream_vods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration INTEGER, -- duration in seconds
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stream polls table
CREATE TABLE IF NOT EXISTS public.stream_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.stream_polls(id) ON DELETE CASCADE,
  voter_identifier TEXT NOT NULL, -- username or anonymous ID
  selected_option INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_identifier)
);

-- Create stream settings table
CREATE TABLE IF NOT EXISTS public.stream_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  bitrate INTEGER DEFAULT 2500,
  resolution TEXT DEFAULT '1920x1080',
  fps INTEGER DEFAULT 30,
  twitch_api_key TEXT,
  youtube_api_key TEXT,
  notification_email BOOLEAN DEFAULT true,
  notification_push BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id TEXT,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  amount INTEGER NOT NULL, -- amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  message TEXT,
  stripe_payment_intent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create viewer engagement table
CREATE TABLE IF NOT EXISTS public.viewer_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id TEXT NOT NULL,
  viewer_identifier TEXT NOT NULL,
  watch_time INTEGER DEFAULT 0, -- in seconds
  message_count INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stream_id, viewer_identifier)
);

-- Enable RLS on all tables
ALTER TABLE public.stream_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_vods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewer_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stream_schedules
CREATE POLICY "Users can view their own schedules"
  ON public.stream_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
  ON public.stream_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.stream_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.stream_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for stream_clips
CREATE POLICY "Users can view their own clips"
  ON public.stream_clips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clips"
  ON public.stream_clips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips"
  ON public.stream_clips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips"
  ON public.stream_clips FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for stream_vods
CREATE POLICY "Users can view their own vods"
  ON public.stream_vods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vods"
  ON public.stream_vods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vods"
  ON public.stream_vods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vods"
  ON public.stream_vods FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for stream_polls
CREATE POLICY "Users can view their own polls"
  ON public.stream_polls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own polls"
  ON public.stream_polls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls"
  ON public.stream_polls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polls"
  ON public.stream_polls FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for poll_votes (public can vote)
CREATE POLICY "Anyone can view votes"
  ON public.poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create votes"
  ON public.poll_votes FOR INSERT
  WITH CHECK (true);

-- RLS Policies for stream_settings
CREATE POLICY "Users can view their own settings"
  ON public.stream_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON public.stream_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.stream_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for donations
CREATE POLICY "Users can view donations to them"
  ON public.donations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for viewer_engagement
CREATE POLICY "Users can view their stream engagement"
  ON public.viewer_engagement FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage engagement"
  ON public.viewer_engagement FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for stream recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('stream-recordings', 'stream-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stream recordings
CREATE POLICY "Users can upload their own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stream-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'stream-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own recordings"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'stream-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stream-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for updated_at columns
CREATE TRIGGER update_stream_schedules_updated_at
  BEFORE UPDATE ON public.stream_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stream_settings_updated_at
  BEFORE UPDATE ON public.stream_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_viewer_engagement_updated_at
  BEFORE UPDATE ON public.viewer_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();