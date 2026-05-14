CREATE TABLE IF NOT EXISTS public.fazendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo TEXT,
    fazenda TEXT,
    proprietario TEXT,
    cpf_cnpj TEXT,
    inscricao_estadual TEXT,
    responsavel TEXT,
    endereco TEXT,
    municipio TEXT,
    estado TEXT,
    email TEXT,
    telefone TEXT,
    nucleo_agricola TEXT,
    linha_escoamento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.fazendas;
CREATE POLICY "Enable read access for all users" ON public.fazendas FOR SELECT USING (true);

ALTER TABLE public.fazendas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.survey_leads ADD COLUMN IF NOT EXISTS grupo TEXT;
