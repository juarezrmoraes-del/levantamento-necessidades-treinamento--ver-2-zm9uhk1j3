DO $$
BEGIN
  -- Fix auth users nulls that cause 500 errors on login
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- Ensure admin@abapa.com.br exists and password matches customer communication
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@abapa.com.br') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'admin@abapa.com.br',
      crypt('123456', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf'))
    WHERE email = 'admin@abapa.com.br';
  END IF;

  -- Ensure juarez.rmoraes@gmail.com exists and password matches customer communication
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juarez.rmoraes@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'juarez.rmoraes@gmail.com',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Juarez"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('securepassword123', gen_salt('bf'))
    WHERE email = 'juarez.rmoraes@gmail.com';
  END IF;

  -- Ensure profiles exist for both admins
  INSERT INTO public.profiles (id, email, name, role, active)
  SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Administrador'), 'Administrator', true
  FROM auth.users
  WHERE email IN ('admin@abapa.com.br', 'juarez.rmoraes@gmail.com')
  ON CONFLICT (id) DO UPDATE SET role = 'Administrator', active = true;

END $$;
