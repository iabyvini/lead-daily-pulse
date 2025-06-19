
-- Criar enum para os níveis de acesso
CREATE TYPE public.access_level AS ENUM ('user', 'admin', 'ai');

-- Adicionar coluna access_level na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN access_level public.access_level DEFAULT 'user';

-- Atualizar usuários existentes baseado no campo is_admin
UPDATE public.profiles 
SET access_level = CASE 
    WHEN is_admin = true THEN 'admin'::public.access_level
    ELSE 'user'::public.access_level
END;

-- Tornar a coluna access_level obrigatória
ALTER TABLE public.profiles 
ALTER COLUMN access_level SET NOT NULL;

-- Atualizar a função handle_new_user para usar access_level
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, access_level)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'viniciusrodrigues@liguelead.com.br' THEN 'admin'::public.access_level
      ELSE 'user'::public.access_level
    END
  );
  RETURN NEW;
END;
$function$;
