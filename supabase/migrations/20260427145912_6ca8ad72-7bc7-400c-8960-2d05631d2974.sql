
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Only insert if user doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jinulitero@admin.local') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
      'jinulitero@admin.local', crypt('yawaon12', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
    VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', 'jinulitero@admin.local', 'email_verified', true), 'email', new_user_id::text, now(), now(), now());
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'jinulitero@admin.local';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
