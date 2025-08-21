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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_goals: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          difficulty: string
          due_date: string | null
          estimated_duration: string
          id: string
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          due_date?: string | null
          estimated_duration?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          due_date?: string | null
          estimated_duration?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          is_moderated: boolean
          member_count: number
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          is_moderated?: boolean
          member_count?: number
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_moderated?: boolean
          member_count?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          is_moderator: boolean
          joined_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          is_moderator?: boolean
          joined_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          is_moderator?: boolean
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          completed: boolean
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string | null
          created_at: string
          current_amount: number | null
          deadline: string | null
          id: string
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          intensity: number | null
          mood: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          intensity?: number | null
          mood: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          intensity?: number | null
          mood?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          last_activity_date: string | null
          level: number
          streak_count: number
          study_preferences: Json | null
          updated_at: string
          user_id: string
          username: string | null
          vybecoin_balance: number
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_count?: number
          study_preferences?: Json | null
          updated_at?: string
          user_id: string
          username?: string | null
          vybecoin_balance?: number
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_count?: number
          study_preferences?: Json | null
          updated_at?: string
          user_id?: string
          username?: string | null
          vybecoin_balance?: number
          xp?: number
        }
        Relationships: []
      }
      "public.profiles": {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          active: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          price: number
          rarity: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price: number
          rarity?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price?: number
          rarity?: string | null
        }
        Relationships: []
      }
      sponsor_assets: {
        Row: {
          active: boolean
          admin_approved: boolean
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          asset_type: string
          content_data: Json
          created_at: string
          description: string | null
          display_settings: Json | null
          end_date: string | null
          id: string
          sponsor_id: string
          start_date: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          admin_approved?: boolean
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          asset_type: string
          content_data?: Json
          created_at?: string
          description?: string | null
          display_settings?: Json | null
          end_date?: string | null
          id?: string
          sponsor_id: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          admin_approved?: boolean
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          asset_type?: string
          content_data?: Json
          created_at?: string
          description?: string | null
          display_settings?: Json | null
          end_date?: string | null
          id?: string
          sponsor_id?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_assets_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          sponsor_id: string
          status: string
          stripe_subscription_id: string | null
          tier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          sponsor_id: string
          status?: string
          stripe_subscription_id?: string | null
          tier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          sponsor_id?: string
          status?: string
          stripe_subscription_id?: string | null
          tier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_subscriptions_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "sponsor_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_tiers: {
        Row: {
          active: boolean
          benefits: Json
          created_at: string
          display_price: string
          id: string
          max_sponsors: number | null
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          benefits?: Json
          created_at?: string
          display_price: string
          id?: string
          max_sponsors?: number | null
          name: string
          price_cents: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          benefits?: Json
          created_at?: string
          display_price?: string
          id?: string
          max_sponsors?: number | null
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          contact_email: string
          created_at: string
          id: string
          industry: string | null
          organization_name: string
          phone: string | null
          status: string
          stripe_customer_id: string | null
          target_demographics: Json | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          contact_email: string
          created_at?: string
          id?: string
          industry?: string | null
          organization_name: string
          phone?: string | null
          status?: string
          stripe_customer_id?: string | null
          target_demographics?: Json | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: string
          industry?: string | null
          organization_name?: string
          phone?: string | null
          status?: string
          stripe_customer_id?: string | null
          target_demographics?: Json | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      sticky_notes: {
        Row: {
          color: string | null
          content: string
          created_at: string
          id: string
          position_x: number | null
          position_y: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_session_participants: {
        Row: {
          id: string
          joined_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          active: boolean | null
          created_at: string
          current_participants: number | null
          description: string | null
          duration_minutes: number | null
          id: string
          max_participants: number | null
          session_date: string
          subject: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          max_participants?: number | null
          session_date: string
          subject: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          max_participants?: number | null
          session_date?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          id: string
          progress_data: Json | null
          started_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress_data?: Json | null
          started_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress_data?: Json | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "vybestryke_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          custom_quote_collections: Json | null
          dashboard_layout: Json | null
          font_family: string | null
          id: string
          mood_categories: string[] | null
          personal_mantras: string[] | null
          theme_gradient: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_quote_collections?: Json | null
          dashboard_layout?: Json | null
          font_family?: string | null
          id?: string
          mood_categories?: string[] | null
          personal_mantras?: string[] | null
          theme_gradient?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_quote_collections?: Json | null
          dashboard_layout?: Json | null
          font_family?: string | null
          id?: string
          mood_categories?: string[] | null
          personal_mantras?: string[] | null
          theme_gradient?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json
          sku: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          sku: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          sku?: string
          user_id?: string
        }
        Relationships: []
      }
      venting_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      vybestryke_challenges: {
        Row: {
          active: boolean | null
          category: string
          created_at: string
          daily: boolean | null
          description: string
          difficulty: string | null
          id: string
          metadata: Json | null
          title: string
          vybecoin_reward: number | null
          xp_reward: number
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string
          daily?: boolean | null
          description: string
          difficulty?: string | null
          id?: string
          metadata?: Json | null
          title: string
          vybecoin_reward?: number | null
          xp_reward: number
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string
          daily?: boolean | null
          description?: string
          difficulty?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          vybecoin_reward?: number | null
          xp_reward?: number
        }
        Relationships: []
      }
      vybetree_progress: {
        Row: {
          id: string
          level: number
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          id?: string
          level?: number
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          id?: string
          level?: number
          updated_at?: string | null
          user_id?: string
          xp?: number
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
