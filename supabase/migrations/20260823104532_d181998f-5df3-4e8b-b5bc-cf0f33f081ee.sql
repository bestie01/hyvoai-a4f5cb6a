CREATE TABLE public.hyvo_agent_settings (
  user_id UUID NOT NULL PRIMARY KEY,
  wake_word_enabled BOOLEAN NOT NULL DEFAULT true,
  wake_word TEXT NOT NULL DEFAULT 'hyvo',
  push_to_talk_key TEXT NOT NULL DEFAULT 'v',
  voice_enabled BOOLEAN NOT NULL DEFAULT true,
  voice_id TEXT NOT NULL DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  autonomy TEXT NOT NULL DEFAULT 'assist',
  auto_moderate BOOLEAN NOT NULL DEFAULT true,
  auto_answer BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hyvo_agent_settings TO authenticated;
GRANT ALL ON public.hyvo_agent_settings TO service_role;

ALTER TABLE public.hyvo_agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own hyvo settings"
  ON public.hyvo_agent_settings FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER update_hyvo_agent_settings_updated_at
  BEFORE UPDATE ON public.hyvo_agent_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.hyvo_agent_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  stream_id TEXT,
  spoken BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hyvo_agent_events TO authenticated;
GRANT ALL ON public.hyvo_agent_events TO service_role;

ALTER TABLE public.hyvo_agent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own hyvo events"
  ON public.hyvo_agent_events FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX hyvo_agent_events_user_created_idx
  ON public.hyvo_agent_events (user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.hyvo_agent_events;