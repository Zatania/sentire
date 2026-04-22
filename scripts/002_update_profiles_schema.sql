-- ============================================================
-- Sentire: Role-Based Architecture with AI Integration
-- Migration 002: Add profiles_admin, profiles_teachers, profiles_students, and student_survey_responses
-- ============================================================

-- ---- profiles_admin ----
CREATE TABLE IF NOT EXISTS public.profiles_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  management_level TEXT NOT NULL CHECK (management_level IN ('superadmin', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles_admin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_select_own" ON public.profiles_admin
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admins_select_all_admins" ON public.profiles_admin
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_admin pa
      WHERE pa.user_id = auth.uid()
    )
  );

-- ---- profiles_teachers ----
CREATE TABLE IF NOT EXISTS public.profiles_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  assigned_classes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_select_own" ON public.profiles_teachers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "teachers_select_all_teachers" ON public.profiles_teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_teachers pt
      WHERE pt.user_id = auth.uid()
    )
  );

CREATE POLICY "admins_select_all_teachers" ON public.profiles_teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_admin pa
      WHERE pa.user_id = auth.uid()
    )
  );

-- ---- profiles_students ----
CREATE TABLE IF NOT EXISTS public.profiles_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  grade_level TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_select_own" ON public.profiles_students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "teachers_select_all_students" ON public.profiles_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_teachers pt
      WHERE pt.user_id = auth.uid()
    )
  );

CREATE POLICY "admins_select_all_students" ON public.profiles_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_admin pa
      WHERE pa.user_id = auth.uid()
    )
  );

-- ---- student_survey_responses ----
CREATE TABLE IF NOT EXISTS public.student_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  category TEXT NOT NULL,
  raw_responses JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.student_survey_responses ENABLE ROW LEVEL SECURITY;

-- Students can only INSERT their own responses
CREATE POLICY "students_insert_own_responses" ON public.student_survey_responses
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Students can only SELECT their own responses
CREATE POLICY "students_select_own_responses" ON public.student_survey_responses
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Teachers can SELECT responses from all students
CREATE POLICY "teachers_select_all_responses" ON public.student_survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_teachers pt
      WHERE pt.user_id = auth.uid()
    )
  );

-- Admins can SELECT all responses
CREATE POLICY "admins_select_all_responses" ON public.student_survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_admin pa
      WHERE pa.user_id = auth.uid()
    )
  );

-- ---- Create indexes for performance ----
CREATE INDEX IF NOT EXISTS idx_student_survey_responses_user_id ON public.student_survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_student_survey_responses_submitted_at ON public.student_survey_responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_student_survey_responses_category ON public.student_survey_responses(category);
CREATE INDEX IF NOT EXISTS idx_profiles_students_user_id ON public.profiles_students(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_teachers_user_id ON public.profiles_teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_user_id ON public.profiles_admin(user_id);
