-- ============================================================
-- Sentire: Mental Health & Academic Tracking System
-- Migration 001: Create core tables
-- ============================================================

-- ---- student profiles ----
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  program TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.student_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.student_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.student_profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.student_profiles 
  FOR DELETE USING (auth.uid() = id);

-- Teachers can read all profiles (for the teacher portal)
CREATE POLICY "profiles_teacher_select_all" ON public.student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ---- wellness_logs ----
CREATE TABLE IF NOT EXISTS public.wellness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wellness_select_own" ON public.wellness_logs
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "wellness_insert_own" ON public.wellness_logs
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "wellness_delete_own" ON public.wellness_logs
  FOR DELETE USING (auth.uid() = student_id);

-- Teachers can read all wellness logs
CREATE POLICY "wellness_teacher_select_all" ON public.wellness_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- ---- academics ----
CREATE TABLE IF NOT EXISTS public.academics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  grade DECIMAL(5,2),
  semester TEXT,
  academic_year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.academics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academics_select_own" ON public.academics
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "academics_insert_own" ON public.academics
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "academics_update_own" ON public.academics
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "academics_delete_own" ON public.academics
  FOR DELETE USING (auth.uid() = student_id);

-- ---- Auto-create profile trigger ----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.student_profiles (id, full_name, program, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'program', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

