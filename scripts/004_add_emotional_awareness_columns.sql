-- ============================================================
-- Sentire: Add emotional awareness survey columns to survey_responses
-- Migration 004: Add new emotional awareness question columns
-- ============================================================

-- Add the new emotional awareness question columns to survey_responses
ALTER TABLE public.survey_responses
ADD COLUMN IF NOT EXISTS q1 TEXT,
ADD COLUMN IF NOT EXISTS q2 TEXT,
ADD COLUMN IF NOT EXISTS q3 TEXT,
ADD COLUMN IF NOT EXISTS q4 TEXT,
ADD COLUMN IF NOT EXISTS q5 TEXT,
ADD COLUMN IF NOT EXISTS q6 TEXT,
ADD COLUMN IF NOT EXISTS q7 TEXT,
ADD COLUMN IF NOT EXISTS q8 TEXT,
ADD COLUMN IF NOT EXISTS q9 TEXT,
ADD COLUMN IF NOT EXISTS q10 TEXT,
ADD COLUMN IF NOT EXISTS q11 TEXT,
ADD COLUMN IF NOT EXISTS q12 TEXT,
ADD COLUMN IF NOT EXISTS q13 TEXT,
ADD COLUMN IF NOT EXISTS q14 TEXT,
ADD COLUMN IF NOT EXISTS q15 TEXT;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_survey_responses_q1 ON public.survey_responses(q1);
CREATE INDEX IF NOT EXISTS idx_survey_responses_q2 ON public.survey_responses(q2);
CREATE INDEX IF NOT EXISTS idx_survey_responses_q15 ON public.survey_responses(q15);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
