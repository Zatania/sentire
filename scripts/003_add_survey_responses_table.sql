-- ============================================================
-- Sentire: Add missing survey question columns to survey_responses table
-- Migration 003: Add survey question columns
-- ============================================================

-- ---- Add survey question columns if they don't exist ----
-- Loneliness Section
ALTER TABLE public.survey_responses
ADD COLUMN IF NOT EXISTS q2_lonely_1 TEXT,
ADD COLUMN IF NOT EXISTS q3_lonely_2 TEXT,
ADD COLUMN IF NOT EXISTS q4_lonely_3 TEXT,
ADD COLUMN IF NOT EXISTS q5_lonely_4 TEXT,
-- Procrastination Section
ADD COLUMN IF NOT EXISTS q6_procrastinate_1 TEXT,
ADD COLUMN IF NOT EXISTS q7_procrastinate_2 TEXT,
ADD COLUMN IF NOT EXISTS q8_procrastinate_3 TEXT,
ADD COLUMN IF NOT EXISTS q9_procrastinate_4 TEXT,
ADD COLUMN IF NOT EXISTS q10_procrastinate_5 TEXT,
-- Depression Section
ADD COLUMN IF NOT EXISTS q11_depressed_1 TEXT,
ADD COLUMN IF NOT EXISTS q12_depressed_2 TEXT,
ADD COLUMN IF NOT EXISTS q13_depressed_3 TEXT,
-- Stress and Sleep
ADD COLUMN IF NOT EXISTS q14_stress_1 TEXT,
ADD COLUMN IF NOT EXISTS q15_sleep_1 TEXT,
ADD COLUMN IF NOT EXISTS q16_sleep_2 TEXT,
-- Work-life Balance
ADD COLUMN IF NOT EXISTS q17_balance_1 TEXT,
ADD COLUMN IF NOT EXISTS q18_balance_2 TEXT,
-- Additional meta fields (if not exist)
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ---- Create indexes for performance ----
CREATE INDEX IF NOT EXISTS idx_survey_responses_student_id ON public.survey_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON public.survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_program ON public.survey_responses(program);

-- ---- Refresh PostgREST schema cache ----
NOTIFY pgrst, 'reload schema';
