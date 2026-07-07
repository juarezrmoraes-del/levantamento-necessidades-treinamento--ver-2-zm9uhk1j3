-- Ensures public.fazendas exists with the full schema and RLS policies.
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.fazendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cpf_cnpj TEXT,
  email TEXT,
  endereco TEXT,
  estado TEXT,
  fazenda TEXT,
  grupo TEXT,
  inscricao_estadual TEXT,
  linha_escoamento TEXT,
  municipio TEXT,
  nucleo_agricola TEXT,
  proprietario TEXT,
  responsavel TEXT,
  telefone TEXT
);

-- Ensure all required columns exist (safe for existing tables missing some columns)
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS fazenda TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS grupo TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS linha_escoamento TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS nucleo_agricola TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS proprietario TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS responsavel TEXT;
ALTER TABLE public.fazendas ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Enable Row Level Security
ALTER TABLE public.fazendas ENABLE ROW LEVEL SECURITY;

-- Recreate SELECT policy for anon and authenticated roles (idempotent)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.fazendas;
CREATE POLICY "Enable read access for all users" ON public.fazendas
  FOR SELECT TO anon, authenticated USING (true);

-- Recreate INSERT policy for anon and authenticated roles (idempotent)
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.fazendas;
CREATE POLICY "Enable insert access for all users" ON public.fazendas
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow authenticated users to update fazendas (idempotent)
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.fazendas;
CREATE POLICY "Enable update access for authenticated users" ON public.fazendas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to delete fazendas (idempotent)
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.fazendas;
CREATE POLICY "Enable delete access for authenticated users" ON public.fazendas
  FOR DELETE TO authenticated USING (true);

-- Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS fazendas_grupo_idx ON public.fazendas (grupo);
CREATE INDEX IF NOT EXISTS fazendas_fazenda_idx ON public.fazendas (fazenda);
CREATE INDEX IF NOT EXISTS fazendas_estado_idx ON public.fazendas (estado);
CREATE INDEX IF NOT EXISTS fazendas_municipio_idx ON public.fazendas (municipio);

-- Notify PostgREST to refresh its schema cache so the table becomes visible
NOTIFY pgrst, 'reload schema';
