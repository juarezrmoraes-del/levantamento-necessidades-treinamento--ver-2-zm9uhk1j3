DO $$
DECLARE
  admin_user_id uuid;
  juarez_user_id uuid;
BEGIN
  -- Seed admin@abapa.com.br
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@abapa.com.br') THEN
    admin_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@abapa.com.br',
      crypt('123456', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, active)
    VALUES (admin_user_id, 'admin@abapa.com.br', 'Administrador', 'Administrator', true)
    ON CONFLICT (id) DO UPDATE SET role = 'Administrator', active = true;
  ELSE
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@abapa.com.br' LIMIT 1;
    INSERT INTO public.profiles (id, email, name, role, active)
    VALUES (admin_user_id, 'admin@abapa.com.br', 'Administrador', 'Administrator', true)
    ON CONFLICT (id) DO UPDATE SET role = 'Administrator', active = true;
  END IF;

  -- Seed juarez.rmoraes@gmail.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juarez.rmoraes@gmail.com') THEN
    juarez_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      juarez_user_id,
      '00000000-0000-0000-0000-000000000000',
      'juarez.rmoraes@gmail.com',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Juarez"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, active)
    VALUES (juarez_user_id, 'juarez.rmoraes@gmail.com', 'Juarez', 'Administrator', true)
    ON CONFLICT (id) DO UPDATE SET role = 'Administrator', active = true;
  ELSE
    SELECT id INTO juarez_user_id FROM auth.users WHERE email = 'juarez.rmoraes@gmail.com' LIMIT 1;
    INSERT INTO public.profiles (id, email, name, role, active)
    VALUES (juarez_user_id, 'juarez.rmoraes@gmail.com', 'Juarez', 'Administrator', true)
    ON CONFLICT (id) DO UPDATE SET role = 'Administrator', active = true;
  END IF;
END $$;
