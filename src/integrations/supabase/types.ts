export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_reports: {
        Row: {
          contatos_falados: number
          created_at: string
          data_registro: string
          id: string
          ligacoes_realizadas: number
          reunioes_agendadas: number
          reunioes_realizadas: number
          updated_at: string
          vendedor: string
        }
        Insert: {
          contatos_falados?: number
          created_at?: string
          data_registro: string
          id?: string
          ligacoes_realizadas?: number
          reunioes_agendadas?: number
          reunioes_realizadas?: number
          updated_at?: string
          vendedor: string
        }
        Update: {
          contatos_falados?: number
          created_at?: string
          data_registro?: string
          id?: string
          ligacoes_realizadas?: number
          reunioes_agendadas?: number
          reunioes_realizadas?: number
          updated_at?: string
          vendedor?: string
        }
        Relationships: []
      }
      meeting_details: {
        Row: {
          created_at: string
          data_agendamento: string
          horario_agendamento: string
          id: string
          nome_lead: string
          report_id: string | null
          status: string
          vendedor_responsavel: string | null
        }
        Insert: {
          created_at?: string
          data_agendamento: string
          horario_agendamento: string
          id?: string
          nome_lead: string
          report_id?: string | null
          status: string
          vendedor_responsavel?: string | null
        }
        Update: {
          created_at?: string
          data_agendamento?: string
          horario_agendamento?: string
          id?: string
          nome_lead?: string
          report_id?: string | null
          status?: string
          vendedor_responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_details_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_reports_alerts: {
        Row: {
          alert_sent: boolean | null
          created_at: string
          id: string
          missing_date: string
          sdr_name: string
        }
        Insert: {
          alert_sent?: boolean | null
          created_at?: string
          id?: string
          missing_date: string
          sdr_name: string
        }
        Update: {
          alert_sent?: boolean | null
          created_at?: string
          id?: string
          missing_date?: string
          sdr_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
      submission_audit: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          status: string
          submission_data: Json
          user_agent: string | null
          user_email: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          status: string
          submission_data: Json
          user_agent?: string | null
          user_email: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          submission_data?: Json
          user_agent?: string | null
          user_email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      access_level: "user" | "admin" | "ai"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: ["user", "admin", "ai"],
    },
  },
} as const
