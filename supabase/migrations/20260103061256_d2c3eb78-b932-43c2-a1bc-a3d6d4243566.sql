-- Add DELETE policies for tables missing them

-- chat_analysis DELETE policy
CREATE POLICY "Users can delete their own chat analysis" 
ON public.chat_analysis 
FOR DELETE 
USING (auth.uid() = user_id);

-- stream_highlights DELETE policy
CREATE POLICY "Users can delete their own stream highlights" 
ON public.stream_highlights 
FOR DELETE 
USING (auth.uid() = user_id);

-- stream_settings DELETE policy
CREATE POLICY "Users can delete their own stream settings" 
ON public.stream_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- ai_predictions DELETE policy
CREATE POLICY "Users can delete their own AI predictions" 
ON public.ai_predictions 
FOR DELETE 
USING (auth.uid() = user_id);

-- ai_generated_content DELETE policy
CREATE POLICY "Users can delete their own AI generated content" 
ON public.ai_generated_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- chat_moderation_actions UPDATE and DELETE policies
CREATE POLICY "Users can update their own moderation actions" 
ON public.chat_moderation_actions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moderation actions" 
ON public.chat_moderation_actions 
FOR DELETE 
USING (auth.uid() = user_id);