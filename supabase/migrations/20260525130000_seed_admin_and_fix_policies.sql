DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Ensure admin user exists for testing purposes
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juarez.rmoraes@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'juarez.rmoraes@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Juarez Moraes"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'juarez.rmoraes@gmail.com', 'Juarez Moraes', 'Administrator')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create audit_logs table just in case it is missing but expected by the store
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT,
  user_email TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for audit_logs
DROP POLICY IF EXISTS "Enable all operations for authenticated on audit_logs" ON public.audit_logs;
CREATE POLICY "Enable all operations for authenticated on audit_logs" ON public.audit_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Ensure delete is allowed on survey_leads
DROP POLICY IF EXISTS "Enable delete for authenticated on survey_leads" ON public.survey_leads;
CREATE POLICY "Enable delete for authenticated on survey_leads" ON public.survey_leads
  FOR DELETE TO authenticated USING (true);
