ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS detalhes_cursos JSONB DEFAULT '{}'::jsonb;
