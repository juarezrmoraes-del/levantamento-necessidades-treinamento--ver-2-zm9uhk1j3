-- Fix for "new row violates row-level security policy for table 'fazendas'"
-- Allow anonymous and authenticated users to insert new groups and fazendas dynamically from the survey form
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.fazendas;
CREATE POLICY "Enable insert access for all users" ON public.fazendas
  FOR INSERT TO anon, authenticated WITH CHECK (true);
