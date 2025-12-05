-- Create table for survey_kantin_yongjinone
CREATE TABLE IF NOT EXISTS public.survey_kantin_yongjinone (
  id SERIAL PRIMARY KEY,
  nik TEXT,
  ktp TEXT,
  name TEXT,
  department TEXT,
  sex TEXT,
  option_a BOOLEAN DEFAULT FALSE,
  option_b BOOLEAN DEFAULT FALSE,
  date_verified TIMESTAMP WITH TIME ZONE
);

-- Disable RLS for testing (enable later with proper policies)
ALTER TABLE public.survey_kantin_yongjinone DISABLE ROW LEVEL SECURITY;

-- Optional: Insert sample data
INSERT INTO public.survey_kantin_yongjinone (nik, ktp, name, department, sex) VALUES
('YJ1_015126', '1234567890123456', 'John Doe', 'IT', 'M'),
('YJ1_015127', '1234567890123457', 'Jane Smith', 'HR', 'F')
ON CONFLICT DO NOTHING;

-- Check if table exists and has data
SELECT * FROM public.survey_kantin_yongjinone LIMIT 5;