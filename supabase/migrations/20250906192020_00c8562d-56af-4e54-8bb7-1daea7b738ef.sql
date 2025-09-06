-- Create chat_analysis table for AI chat sentiment analysis
CREATE TABLE public.chat_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  toxicity_score INTEGER CHECK (toxicity_score >= 0 AND toxicity_score <= 100),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  topics JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  moderation_flags JSONB DEFAULT '[]'::jsonb,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stream_highlights table for AI-generated highlights
CREATE TABLE public.stream_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_highlights ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_analysis
CREATE POLICY "Users can view their own chat analysis" 
ON public.chat_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat analysis" 
ON public.chat_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Edge functions can create chat analysis" 
ON public.chat_analysis 
FOR INSERT 
WITH CHECK (true);

-- Create policies for stream_highlights  
CREATE POLICY "Users can view their own highlights" 
ON public.stream_highlights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own highlights" 
ON public.stream_highlights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Edge functions can create highlights" 
ON public.stream_highlights 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_chat_analysis_user_id ON public.chat_analysis(user_id);
CREATE INDEX idx_chat_analysis_stream_id ON public.chat_analysis(stream_id);
CREATE INDEX idx_chat_analysis_analyzed_at ON public.chat_analysis(analyzed_at);

CREATE INDEX idx_stream_highlights_user_id ON public.stream_highlights(user_id);
CREATE INDEX idx_stream_highlights_stream_id ON public.stream_highlights(stream_id);
CREATE INDEX idx_stream_highlights_generated_at ON public.stream_highlights(generated_at);