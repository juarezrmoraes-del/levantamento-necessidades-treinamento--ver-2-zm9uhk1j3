-- Fix Row-Level Security policy for survey_leads table
ALTER TABLE public.survey_leads ENABLE ROW LEVEL SECURITY;

DO $DO$
BEGIN
  -- Drop existing policies that might be restrictive
  DROP POLICY IF EXISTS "Enable insert for anonymous" ON public.survey_leads;
  DROP POLICY IF EXISTS "Enable select for authenticated" ON public.survey_leads;
  DROP POLICY IF EXISTS "Enable update for authenticated" ON public.survey_leads;
  DROP POLICY IF EXISTS "Enable delete for authenticated" ON public.survey_leads;
  DROP POLICY IF EXISTS "Enable all operations for everyone" ON public.survey_leads;
END $DO$;

-- Create an open policy to guarantee successful inserts, updates and selects from the frontend forms
CREATE POLICY "Enable all operations for everyone" ON public.survey_leads
  FOR ALL USING (true) WITH CHECK (true);
