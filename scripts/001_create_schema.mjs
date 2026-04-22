import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const sql =
  -- ----profiles ----
    CREATE TABLE IF NOT EXISTS public.profiles(
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      course TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
    CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING(auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK(auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING(auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_delete_own') THEN
    CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING(auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_teacher_select_all') THEN
    CREATE POLICY "profiles_teacher_select_all" ON public.profiles
      FOR SELECT USING(
      EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
    );
  END IF;
END $$;

-- ----wellness_logs ----
  CREATE TABLE IF NOT EXISTS public.wellness_logs(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emotion TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'wellness_select_own') THEN
    CREATE POLICY "wellness_select_own" ON public.wellness_logs FOR SELECT USING(auth.uid() = student_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'wellness_insert_own') THEN
    CREATE POLICY "wellness_insert_own" ON public.wellness_logs FOR INSERT WITH CHECK(auth.uid() = student_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'wellness_delete_own') THEN
    CREATE POLICY "wellness_delete_own" ON public.wellness_logs FOR DELETE USING(auth.uid() = student_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'wellness_teacher_select_all') THEN
    CREATE POLICY "wellness_teacher_select_all" ON public.wellness_logs
      FOR SELECT USING(
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
  );
  END IF;
END $$;

-- ----academics ----
  CREATE TABLE IF NOT EXISTS public.academics(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    grade DECIMAL(5, 2),
    semester TEXT,
    academic_year TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

ALTER TABLE public.academics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'academics' AND policyname = 'academics_select_own') THEN
    CREATE POLICY "academics_select_own" ON public.academics FOR SELECT USING(auth.uid() = student_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'academics' AND policyname = 'academics_insert_own') THEN
    CREATE POLICY "academics_insert_own" ON public.academics FOR INSERT WITH CHECK(auth.uid() = student_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'academics' AND policyname = 'academics_update_own') THEN
    CREATE POLICY "academics_update_own" ON public.academics FOR UPDATE USING(auth.uid() = student_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'academics' AND policyname = 'academics_delete_own') THEN
    CREATE POLICY "academics_delete_own" ON public.academics FOR DELETE USING(auth.uid() = student_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'academics' AND policyname = 'academics_teacher_select_all') THEN
    CREATE POLICY "academics_teacher_select_all" ON public.academics
      FOR SELECT USING(
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
  );
  END IF;
END $$;

-- ----Auto - create profile trigger----
  CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, course, role)
VALUES(
  NEW.id,
  COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
  COALESCE(NEW.raw_user_meta_data ->> 'course', NULL),
  COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
)
  ON CONFLICT(id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


async function run() {
  console.log('[v0] Running Sentire DB migration via Supabase RPC...')

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).maybeSingle()

  if (error) {
    // rpc may not exist, fall back to direct REST
    console.log('[v0] RPC not available, trying pg directly...')
    // Use the postgres URL directly
    const { default: postgres } = await import('postgres')
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
    if (!connectionString) {
      console.error('[v0] No postgres connection string found')
      process.exit(1)
    }
    const pg = postgres(connectionString, { ssl: 'require' })
    try {
      await pg.unsafe(sql)
      console.log('[v0] Migration completed successfully via postgres!')
      await pg.end()
    } catch (pgErr) {
      console.error('[v0] Migration failed:', pgErr.message)
      await pg.end()
      process.exit(1)
    }
  } else {
    console.log('[v0] Migration completed successfully via RPC!')
  }
}

run()
