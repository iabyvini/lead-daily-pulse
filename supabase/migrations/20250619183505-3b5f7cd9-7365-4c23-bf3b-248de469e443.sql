
-- Corrigir o access_level do usuário Manus01 para 'ai'
UPDATE public.profiles 
SET access_level = 'ai'::public.access_level 
WHERE email = 'Manus01';
