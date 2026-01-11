-- Add payment tracking and pause columns to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ;