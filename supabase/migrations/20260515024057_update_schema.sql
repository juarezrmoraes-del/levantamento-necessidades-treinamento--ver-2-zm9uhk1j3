DO $$
BEGIN
  -- Create profiles table
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'Viewer',
    active BOOLEAN DEFAULT true,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);

-- Trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, active)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 'Viewer', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Columns for survey_leads
ALTER TABLE public.survey_leads
  ADD COLUMN IF NOT EXISTS funcao TEXT,
  ADD COLUMN IF NOT EXISTS localizacao TEXT,
  ADD COLUMN IF NOT EXISTS tamanho TEXT,
  ADD COLUMN IF NOT EXISTS cultura TEXT,
  ADD COLUMN IF NOT EXISTS sistema TEXT,
  ADD COLUMN IF NOT EXISTS gargalo TEXT,
  ADD COLUMN IF NOT EXISTS desafio TEXT,
  ADD COLUMN IF NOT EXISTS setor TEXT,
  ADD COLUMN IF NOT EXISTS cursos JSONB,
  ADD COLUMN IF NOT EXISTS vagas JSONB,
  ADD COLUMN IF NOT EXISTS vagas_homens JSONB,
  ADD COLUMN IF NOT EXISTS vagas_mulheres JSONB,
  ADD COLUMN IF NOT EXISTS modalidade TEXT,
  ADD COLUMN IF NOT EXISTS infraestrutura TEXT,
  ADD COLUMN IF NOT EXISTS epoca TEXT,
  ADD COLUMN IF NOT EXISTS inovacao TEXT,
  ADD COLUMN IF NOT EXISTS detalhes_cursos JSONB;

-- Policies for survey_leads
ALTER TABLE public.survey_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for anonymous" ON public.survey_leads;
CREATE POLICY "Enable insert for anonymous" ON public.survey_leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for authenticated" ON public.survey_leads;
CREATE POLICY "Enable select for authenticated" ON public.survey_leads FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated" ON public.survey_leads;
CREATE POLICY "Enable update for authenticated" ON public.survey_leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policies for fazendas
ALTER TABLE public.fazendas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.fazendas;
CREATE POLICY "Enable read access for all users" ON public.fazendas FOR SELECT USING (true);

-- Seed users
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
      crypt('Admin@123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Juarez Moraes"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, active)
    VALUES (new_user_id, 'juarez.rmoraes@gmail.com', 'Juarez Moraes', 'Administrator', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@abapa.com.br') THEN
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
      'admin@abapa.com.br',
      crypt('Admin@123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin ABAPA"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, active)
    VALUES (new_user_id, 'admin@abapa.com.br', 'Admin ABAPA', 'Administrator', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
