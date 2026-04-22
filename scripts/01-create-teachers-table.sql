-- Create teachers table to store faculty account details
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  employee_id TEXT UNIQUE,
  department TEXT,
  phone_number TEXT,
  office_location TEXT,
  specialization TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Policy for teachers to view their own record
CREATE POLICY "Teachers can view their own profile" 
  ON public.teachers 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for teachers to update their own record
CREATE POLICY "Teachers can update their own profile" 
  ON public.teachers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for admins to view all teachers
CREATE POLICY "Admins can view all teachers" 
  ON public.teachers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy for admins to update any teacher
CREATE POLICY "Admins can update all teachers" 
  ON public.teachers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);
