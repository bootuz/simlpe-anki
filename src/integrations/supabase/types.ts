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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      card_fsrs: {
        Row: {
          card_id: string
          created_at: string
          difficulty: number
          due_date: string | null
          elapsed_days: number
          id: string
          lapses: number
          last_review: string | null
          learning_steps: number
          reps: number
          scheduled_days: number
          stability: number
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          difficulty?: number
          due_date?: string | null
          elapsed_days?: number
          id?: string
          lapses?: number
          last_review?: string | null
          learning_steps?: number
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          difficulty?: number
          due_date?: string | null
          elapsed_days?: number
          id?: string
          lapses?: number
          last_review?: string | null
          learning_steps?: number
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_fsrs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_fsrs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_fsrs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "study_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_card_fsrs_card_id"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_card_fsrs_card_id"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_card_fsrs_card_id"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "study_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          back: string
          created_at: string
          deck_id: string
          front: string
          id: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string
          deck_id: string
          front: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          created_at?: string
          deck_id?: string
          front?: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cards_deck_id"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "cards_with_details"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "decks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "study_cards"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "fk_decks_folder_id"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "cards_with_details"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "fk_decks_folder_id"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_decks_folder_id"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "study_cards"
            referencedColumns: ["folder_id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fsrs_parameters: {
        Row: {
          created_at: string | null
          id: string
          parameters: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parameters?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parameters?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_logs: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          rating: number
          review_log: Json
          review_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          rating: number
          review_log?: Json
          review_time?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          review_log?: Json
          review_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_review_logs_card_id"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_review_logs_card_id"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_review_logs_card_id"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "study_cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cards_with_details: {
        Row: {
          back: string | null
          created_at: string | null
          deck_id: string | null
          deck_name: string | null
          difficulty: number | null
          due_date: string | null
          folder_id: string | null
          folder_name: string | null
          front: string | null
          id: string | null
          lapses: number | null
          last_review: string | null
          reps: number | null
          stability: number | null
          state: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cards_deck_id"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      study_cards: {
        Row: {
          back: string | null
          created_at: string | null
          deck_id: string | null
          deck_name: string | null
          difficulty: number | null
          due_date: string | null
          folder_id: string | null
          folder_name: string | null
          front: string | null
          id: string | null
          lapses: number | null
          last_review: string | null
          ready_status: string | null
          reps: number | null
          stability: number | null
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cards_deck_id"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_english_sample_data: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_cards_with_details: {
        Args: { p_user_id?: string }
        Returns: {
          back: string
          created_at: string
          deck_id: string
          deck_name: string
          difficulty: number
          due_date: string
          folder_id: string
          folder_name: string
          front: string
          id: string
          lapses: number
          last_review: string
          reps: number
          stability: number
          state: string
          updated_at: string
          user_id: string
        }[]
      }
      get_cards_with_tag_stats: {
        Args: { p_user_id?: string }
        Returns: {
          back: string
          created_at: string
          deck_id: string
          front: string
          id: string
          tag_count: number
          tags: string[]
          updated_at: string
          user_id: string
        }[]
      }
      get_deck_card_counts: {
        Args: { p_user_id: string }
        Returns: {
          card_count: number
          deck_id: string
        }[]
      }
      get_study_cards: {
        Args: { p_user_id?: string }
        Returns: {
          back: string
          created_at: string
          deck_id: string
          deck_name: string
          difficulty: number
          due_date: string
          folder_id: string
          folder_name: string
          front: string
          id: string
          lapses: number
          last_review: string
          ready_status: string
          reps: number
          stability: number
          state: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_tags: {
        Args: { user_uuid: string }
        Returns: {
          count: number
          tag: string
        }[]
      }
      search_cards_by_tags: {
        Args: { p_user_id?: string; tag_query: string[] }
        Returns: {
          back: string
          created_at: string
          deck_id: string
          front: string
          id: string
          tags: string[]
          updated_at: string
          user_id: string
        }[]
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
