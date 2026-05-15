CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed setting
INSERT INTO public.system_settings (id, notification_email)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'juarez.rmoraes@gmail.com')
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.system_settings;
CREATE POLICY "Enable read access for all users" ON public.system_settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated" ON public.system_settings;
CREATE POLICY "Enable write access for authenticated" ON public.system_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
