-- Remove previous conflicting policy if exists
DROP POLICY IF EXISTS "Enable delete for authenticated on survey_leads" ON public.survey_leads;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.survey_leads;

-- Create correct policy for deletion
CREATE POLICY "Enable delete for all users" ON public.survey_leads
FOR DELETE USING (true);

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user juarez.rmoraes@gmail.com
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
      '{"name": "Juarez"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    -- Also insert into public.profiles
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'juarez.rmoraes@gmail.com', 'Juarez', 'Administrator')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
