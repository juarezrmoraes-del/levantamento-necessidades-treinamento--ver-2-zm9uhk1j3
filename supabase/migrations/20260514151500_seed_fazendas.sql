DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.fazendas LIMIT 1) THEN
    INSERT INTO public.fazendas (grupo, fazenda, estado, municipio) VALUES
      ('Grupo SLC Agrícola', 'Fazenda Panorama', 'BA', 'Correntina'),
      ('Grupo SLC Agrícola', 'Fazenda Palmares', 'BA', 'Barreiras'),
      ('Grupo SLC Agrícola', 'Fazenda Parceiro', 'BA', 'Formosa do Rio Preto'),
      ('Grupo Horita', 'Fazenda Cidade Verde', 'BA', 'São Desidério'),
      ('Grupo Horita', 'Fazenda Bergmann', 'BA', 'São Desidério'),
      ('Grupo Busato', 'Fazenda São Bonifácio', 'BA', 'São Desidério'),
      ('Grupo Busato', 'Fazenda Nova', 'BA', 'São Desidério'),
      ('Grupo Franciosi', 'Fazenda Franciosi', 'BA', 'Luís Eduardo Magalhães'),
      ('Grupo Mizote', 'Fazenda Mizote', 'BA', 'São Desidério'),
      ('Grupo Gorgen', 'Fazenda Gorgen', 'BA', 'Formosa do Rio Preto'),
      ('Grupo Schmidt', 'Fazenda Orquídeas', 'BA', 'Barreiras'),
      ('Grupo Zancanaro', 'Fazenda Zancanaro', 'BA', 'Luís Eduardo Magalhães'),
      ('Grupo Morinaga', 'Fazenda Morinaga', 'BA', 'Barreiras'),
      ('Grupo Zanotto', 'Fazenda Zanotto', 'BA', 'Luís Eduardo Magalhães');
  END IF;
END $$;
