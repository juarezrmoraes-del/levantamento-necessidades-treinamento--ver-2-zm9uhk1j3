// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
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
      sent_emails: {
        Row: {
          body: string | null
          created_at: string | null
          error_message: string | null
          id: string
          status: string | null
          subject: string | null
          to: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          subject?: string | null
          to: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          subject?: string | null
          to?: string
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
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          notification_email: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_email?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_email?: string | null
          updated_at?: string | null
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
          from: "*"
          to: "survey_leads"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

