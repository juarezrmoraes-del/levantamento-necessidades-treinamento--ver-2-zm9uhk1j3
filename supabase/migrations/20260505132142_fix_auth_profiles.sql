-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    'Viewer',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after inserting an auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Admins and users can update profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'Administrator')
  );

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'Administrator')
  );

-- Policies for surveys
DROP POLICY IF EXISTS "Anyone can insert a survey." ON public.surveys;
CREATE POLICY "Anyone can insert a survey." ON public.surveys FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Surveys are viewable by everyone." ON public.surveys;
CREATE POLICY "Surveys are viewable by everyone." ON public.surveys FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can update surveys." ON public.surveys;
CREATE POLICY "Authenticated users can update surveys." ON public.surveys FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete surveys." ON public.surveys;
CREATE POLICY "Authenticated users can delete surveys." ON public.surveys FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for audit_logs
DROP POLICY IF EXISTS "Audit logs are viewable by everyone." ON public.audit_logs;
CREATE POLICY "Audit logs are viewable by everyone." ON public.audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert audit logs." ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs." ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for system_settings
DROP POLICY IF EXISTS "Settings are viewable by everyone." ON public.system_settings;
CREATE POLICY "Settings are viewable by everyone." ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert settings." ON public.system_settings;
CREATE POLICY "Authenticated users can insert settings." ON public.system_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update settings." ON public.system_settings;
CREATE POLICY "Authenticated users can update settings." ON public.system_settings FOR UPDATE USING (auth.role() = 'authenticated');


-- Seed admin user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Juarez"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, active)
    VALUES (new_user_id, 'juarez.rmoraes@gmail.com', 'Admin Juarez', 'Administrator', true)
    ON CONFLICT (id) DO UPDATE SET role = 'Administrator', active = true;
  END IF;
END $$;
