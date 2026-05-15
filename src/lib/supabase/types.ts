// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      fazendas: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          fazenda: string | null
          grupo: string | null
          id: string
          inscricao_estadual: string | null
          linha_escoamento: string | null
          municipio: string | null
          nucleo_agricola: string | null
          proprietario: string | null
          responsavel: string | null
          telefone: string | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          fazenda?: string | null
          grupo?: string | null
          id?: string
          inscricao_estadual?: string | null
          linha_escoamento?: string | null
          municipio?: string | null
          nucleo_agricola?: string | null
          proprietario?: string | null
          responsavel?: string | null
          telefone?: string | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          fazenda?: string | null
          grupo?: string | null
          id?: string
          inscricao_estadual?: string | null
          linha_escoamento?: string | null
          municipio?: string | null
          nucleo_agricola?: string | null
          proprietario?: string | null
          responsavel?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      survey_leads: {
        Row: {
          created_at: string | null
          cultura: string | null
          cursos: Json | null
          desafio: string | null
          detalhes_cursos: Json | null
          email: string | null
          epoca: string | null
          fazenda: string | null
          funcao: string | null
          gargalo: string | null
          grupo: string | null
          id: string
          infraestrutura: string | null
          inovacao: string | null
          localizacao: string | null
          modalidade: string | null
          nome: string | null
          setor: string | null
          sistema: string | null
          status: string | null
          tamanho: string | null
          vagas: Json | null
          vagas_homens: Json | null
          vagas_mulheres: Json | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          cultura?: string | null
          cursos?: Json | null
          desafio?: string | null
          detalhes_cursos?: Json | null
          email?: string | null
          epoca?: string | null
          fazenda?: string | null
          funcao?: string | null
          gargalo?: string | null
          grupo?: string | null
          id?: string
          infraestrutura?: string | null
          inovacao?: string | null
          localizacao?: string | null
          modalidade?: string | null
          nome?: string | null
          setor?: string | null
          sistema?: string | null
          status?: string | null
          tamanho?: string | null
          vagas?: Json | null
          vagas_homens?: Json | null
          vagas_mulheres?: Json | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          cultura?: string | null
          cursos?: Json | null
          desafio?: string | null
          detalhes_cursos?: Json | null
          email?: string | null
          epoca?: string | null
          fazenda?: string | null
          funcao?: string | null
          gargalo?: string | null
          grupo?: string | null
          id?: string
          infraestrutura?: string | null
          inovacao?: string | null
          localizacao?: string | null
          modalidade?: string | null
          nome?: string | null
          setor?: string | null
          sistema?: string | null
          status?: string | null
          tamanho?: string | null
          vagas?: Json | null
          vagas_homens?: Json | null
          vagas_mulheres?: Json | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_survey_by_id: {
        Args: { search_id: string }
        Returns: {
          created_at: string | null
          cultura: string | null
          cursos: Json | null
          desafio: string | null
          detalhes_cursos: Json | null
          email: string | null
          epoca: string | null
          fazenda: string | null
          funcao: string | null
          gargalo: string | null
          grupo: string | null
          id: string
          infraestrutura: string | null
          inovacao: string | null
          localizacao: string | null
          modalidade: string | null
          nome: string | null
          setor: string | null
          sistema: string | null
          status: string | null
          tamanho: string | null
          vagas: Json | null
          vagas_homens: Json | null
          vagas_mulheres: Json | null
          whatsapp: string | null
        }[]
        SetofOptions: {
          from: '*'
          to: 'survey_leads'
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: fazendas
//   id: uuid (not null, default: gen_random_uuid())
//   grupo: text (nullable)
//   fazenda: text (nullable)
//   proprietario: text (nullable)
//   cpf_cnpj: text (nullable)
//   inscricao_estadual: text (nullable)
//   responsavel: text (nullable)
//   endereco: text (nullable)
//   municipio: text (nullable)
//   estado: text (nullable)
//   email: text (nullable)
//   telefone: text (nullable)
//   nucleo_agricola: text (nullable)
//   linha_escoamento: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'Viewer'::text)
//   active: boolean (nullable, default: true)
//   department: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: survey_leads
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (nullable)
//   whatsapp: text (nullable)
//   email: text (nullable)
//   fazenda: text (nullable)
//   status: text (nullable, default: 'in_progress'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   grupo: text (nullable)
//   funcao: text (nullable)
//   localizacao: text (nullable)
//   tamanho: text (nullable)
//   cultura: text (nullable)
//   sistema: text (nullable)
//   gargalo: text (nullable)
//   desafio: text (nullable)
//   setor: text (nullable)
//   cursos: jsonb (nullable)
//   vagas: jsonb (nullable)
//   vagas_homens: jsonb (nullable)
//   vagas_mulheres: jsonb (nullable)
//   modalidade: text (nullable)
//   infraestrutura: text (nullable)
//   epoca: text (nullable)
//   inovacao: text (nullable)
//   detalhes_cursos: jsonb (nullable)

// --- CONSTRAINTS ---
// Table: fazendas
//   PRIMARY KEY fazendas_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: survey_leads
//   PRIMARY KEY survey_leads_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: fazendas
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: profiles
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: survey_leads
//   Policy "Enable all operations for everyone" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION get_survey_by_id(uuid)
//   CREATE OR REPLACE FUNCTION public.get_survey_by_id(search_id uuid)
//    RETURNS SETOF survey_leads
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY SELECT * FROM public.survey_leads WHERE id = search_id;
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role, active)
//     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 'Viewer', true);
//     RETURN NEW;
//   END;
//   $function$
//
