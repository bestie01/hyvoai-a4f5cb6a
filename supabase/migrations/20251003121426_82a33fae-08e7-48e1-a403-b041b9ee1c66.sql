-- Create chat_moderation_actions table
CREATE TABLE public.chat_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id TEXT NOT NULL,
  message TEXT NOT NULL,
  username TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('warn', 'timeout', 'ban', 'none')),
  toxicity_score INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_predictions table
CREATE TABLE public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prediction_type TEXT NOT NULL,
  prediction_data JSONB NOT NULL,
  confidence_score NUMERIC,
  actual_outcome JSONB,
  accuracy_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_generated_content table
CREATE TABLE public.ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('title', 'description', 'thumbnail', 'clip', 'caption')),
  content_data JSONB NOT NULL,
  stream_id TEXT,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create viewer_qa_knowledge table
CREATE TABLE public.viewer_qa_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  auto_respond BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewer_qa_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_moderation_actions
CREATE POLICY "Users can view their own moderation actions"
  ON public.chat_moderation_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own moderation actions"
  ON public.chat_moderation_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Edge functions can create moderation actions"
  ON public.chat_moderation_actions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for ai_predictions
CREATE POLICY "Users can view their own predictions"
  ON public.ai_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create predictions"
  ON public.ai_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their predictions"
  ON public.ai_predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage predictions"
  ON public.ai_predictions FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ai_generated_content
CREATE POLICY "Users can view their own AI content"
  ON public.ai_generated_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI content"
  ON public.ai_generated_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their AI content"
  ON public.ai_generated_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage AI content"
  ON public.ai_generated_content FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for viewer_qa_knowledge
CREATE POLICY "Users can manage their own Q&A knowledge"
  ON public.viewer_qa_knowledge FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add background_removed column to stream_settings
ALTER TABLE public.stream_settings
ADD COLUMN IF NOT EXISTS background_removed BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX idx_chat_moderation_user ON public.chat_moderation_actions(user_id);
CREATE INDEX idx_chat_moderation_stream ON public.chat_moderation_actions(stream_id);
CREATE INDEX idx_ai_predictions_user ON public.ai_predictions(user_id);
CREATE INDEX idx_ai_content_user ON public.ai_generated_content(user_id);
CREATE INDEX idx_viewer_qa_user ON public.viewer_qa_knowledge(user_id);