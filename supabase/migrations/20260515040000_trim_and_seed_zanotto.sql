DO $$
BEGIN
  -- Trim all existing data to prevent spacing issues
  UPDATE public.fazendas
  SET 
    grupo = TRIM(grupo),
    fazenda = TRIM(fazenda)
  WHERE 
    grupo <> TRIM(grupo) OR fazenda <> TRIM(fazenda);

  -- Seed specifically requested Zanotto farms if they don't exist
  IF NOT EXISTS (SELECT 1 FROM public.fazendas WHERE grupo = 'Grupo Zanotto' AND fazenda = 'Fazenda Zanotto I') THEN
    INSERT INTO public.fazendas (grupo, fazenda, estado, municipio, email) VALUES
      ('Grupo Zanotto', 'Fazenda Zanotto I', 'BA', 'Luís Eduardo Magalhães', 'contato@zanotto.com.br'),
      ('Grupo Zanotto', 'Fazenda Zanotto II', 'BA', 'Luís Eduardo Magalhães', 'contato@zanotto.com.br'),
      ('Grupo Zanotto', 'Fazenda Rio de Ondas', 'BA', 'Luís Eduardo Magalhães', 'contato@zanotto.com.br'),
      ('Grupo Zanotto', 'Fazenda Santa Cruz', 'BA', 'Luís Eduardo Magalhães', 'contato@zanotto.com.br');
  END IF;
END $$;
