CREATE TABLE IF NOT EXISTS public.survey_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  whatsapp TEXT,
  email TEXT,
  fazenda TEXT,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.survey_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for anonymous" ON public.survey_leads;
CREATE POLICY "Enable insert for anonymous" ON public.survey_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for authenticated" ON public.survey_leads;
CREATE POLICY "Enable select for authenticated" ON public.survey_leads
  FOR SELECT TO authenticated USING (true);
