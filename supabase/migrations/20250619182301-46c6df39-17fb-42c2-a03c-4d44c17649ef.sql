
-- Criar usuário IA diretamente na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'Manus01',
  crypt('Manus01', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Criar profile para o usuário IA com access_level 'ai'
INSERT INTO public.profiles (id, email, access_level)
SELECT 
  u.id,
  u.email,
  'ai'::public.access_level
FROM auth.users u
WHERE u.email = 'Manus01'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
