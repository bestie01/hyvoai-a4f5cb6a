-- Create stream_locations table for geolocation-based streaming
CREATE TABLE public.stream_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stream_id TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  accuracy DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stream_locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for stream_locations
CREATE POLICY "Users can view their own locations" ON public.stream_locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own locations" ON public.stream_locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own locations" ON public.stream_locations FOR DELETE USING (auth.uid() = user_id);

-- Create device_sessions table for device analytics
CREATE TABLE public.device_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_model TEXT,
  platform TEXT,
  os_version TEXT,
  manufacturer TEXT,
  is_virtual BOOLEAN DEFAULT false,
  battery_level DECIMAL(5, 2),
  language_code TEXT,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for device_sessions
CREATE POLICY "Users can view their own sessions" ON public.device_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.device_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.device_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.device_sessions FOR DELETE USING (auth.uid() = user_id);