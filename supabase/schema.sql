-- 1. Enums
CREATE TYPE user_role AS ENUM ('Administrator', 'Manager', 'Viewer');
CREATE TYPE survey_status AS ENUM ('Pendente', 'Em Análise', 'Aprovado', 'Rejeitado', 'Programado', 'Concluído');
CREATE TYPE priority_level AS ENUM ('Alta', 'Média', 'Baixa');

-- 2. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'Viewer',
  department TEXT,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Surveys Table
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT,
  created_at TIMESTAMP DEFAULT now(),
  nome TEXT,
  fazenda_grupo TEXT,
  celular TEXT,
  email TEXT,
  area_foco TEXT,
  curso_solicitado TEXT,
  quantidade_colaboradores TEXT,
  local_realizacao TEXT,
  mes_previsto TEXT,
  desafio_roi TEXT,
  sugestao_futura TEXT,
  notification_sent BOOLEAN DEFAULT false,
  status survey_status DEFAULT 'Pendente',
  prioridade priority_level DEFAULT 'Média',
  data_agendada TIMESTAMP,
  funcao TEXT,
  localizacao TEXT,
  tamanho TEXT,
  cultura TEXT,
  sistema TEXT,
  gargalo TEXT,
  infraestrutura TEXT,
  inovacao TEXT,
  vagas_homens TEXT,
  vagas_mulheres TEXT
);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Surveys are viewable by authenticated users." ON surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert a survey." ON surveys FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update surveys." ON surveys FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete surveys." ON surveys FOR DELETE TO authenticated USING (true);

-- 4. Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT now(),
  user_name TEXT,
  user_email TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit logs are viewable by authenticated users." ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit logs." ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 5. System Settings Table
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY,
  notification_email TEXT,
  scheduled_report_emails TEXT,
  scheduled_report_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone." ON system_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update settings." ON system_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert settings." ON system_settings FOR INSERT TO authenticated WITH CHECK (true);

-- Insert default settings
INSERT INTO system_settings (id, notification_email, scheduled_report_emails, scheduled_report_active)
VALUES (1, 'treinamentos@abapa.com.br', 'ct9@abapa.com.br, gerente.ct@abapa.com.br', true)
ON CONFLICT (id) DO NOTHING;

-- Mock Surveys Data for initial demonstration
INSERT INTO surveys (protocol, nome, fazenda_grupo, celular, email, area_foco, curso_solicitado, quantidade_colaboradores, local_realizacao, mes_previsto, desafio_roi, status, prioridade)
VALUES
('TRN-2026-1001', 'João Silva', 'Fazenda São Jorge', '77999999999', 'joao@saojorge.com', 'Linha Agrícola', 'Operação de Tratores', '1 a 5', 'LEM (Centro de Treinamento)', 'Março', 'Redução de Custos', 'Pendente', 'Alta'),
('TRN-2026-1002', 'Maria Oliveira', 'Grupo Agrícola Brasil', '77988888888', 'maria@grupoagricola.com', 'Normas de Segurança', 'NR 31', '6 a 10', 'Rosário', 'Abril', 'Adequação à Norma (Segurança)', 'Em Análise', 'Média'),
('TRN-2026-1003', 'Carlos Eduardo', 'Fazenda Boa Esperança', '77977777777', 'carlos@boaesperanca.com', 'Movimentação de Carga', 'Empilhadeira', '1 a 5', 'LEM (Centro de Treinamento)', 'Maio', 'Aumento de Produtividade', 'Aprovado', 'Alta')
ON CONFLICT DO NOTHING;

