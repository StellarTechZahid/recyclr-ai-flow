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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_generated_content: {
        Row: {
          ai_model: string | null
          content_type: string
          created_at: string
          generated_output: string
          id: string
          is_saved: boolean | null
          metadata: Json | null
          original_input: string | null
          platform: string | null
          rating: number | null
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          content_type: string
          created_at?: string
          generated_output: string
          id?: string
          is_saved?: boolean | null
          metadata?: Json | null
          original_input?: string | null
          platform?: string | null
          rating?: number | null
          user_id: string
        }
        Update: {
          ai_model?: string | null
          content_type?: string
          created_at?: string
          generated_output?: string
          id?: string
          is_saved?: boolean | null
          metadata?: Json | null
          original_input?: string | null
          platform?: string | null
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audience_personas: {
        Row: {
          content_preferences: Json | null
          created_at: string
          demographics: Json | null
          description: string | null
          id: string
          interests: string[] | null
          is_primary: boolean | null
          name: string
          pain_points: string[] | null
          preferred_platforms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_preferences?: Json | null
          created_at?: string
          demographics?: Json | null
          description?: string | null
          id?: string
          interests?: string[] | null
          is_primary?: boolean | null
          name: string
          pain_points?: string[] | null
          preferred_platforms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_preferences?: Json | null
          created_at?: string
          demographics?: Json | null
          description?: string | null
          id?: string
          interests?: string[] | null
          is_primary?: boolean | null
          name?: string
          pain_points?: string[] | null
          preferred_platforms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_voice_profiles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sample_content: string[] | null
          tone: string[] | null
          updated_at: string
          user_id: string
          vocabulary: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sample_content?: string[] | null
          tone?: string[] | null
          updated_at?: string
          user_id: string
          vocabulary?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sample_content?: string[] | null
          tone?: string[] | null
          updated_at?: string
          user_id?: string
          vocabulary?: Json | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          audience_persona_id: string | null
          brand_voice_id: string | null
          content_pieces: Json | null
          created_at: string
          description: string | null
          end_date: string | null
          goal: string | null
          id: string
          metrics: Json | null
          name: string
          schedule: Json | null
          start_date: string | null
          status: string | null
          target_platforms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_persona_id?: string | null
          brand_voice_id?: string | null
          content_pieces?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          metrics?: Json | null
          name: string
          schedule?: Json | null
          start_date?: string | null
          status?: string | null
          target_platforms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_persona_id?: string | null
          brand_voice_id?: string | null
          content_pieces?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          schedule?: Json | null
          start_date?: string | null
          status?: string | null
          target_platforms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_audience_persona_id_fkey"
            columns: ["audience_persona_id"]
            isOneToOne: false
            referencedRelation: "audience_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_voice_id_fkey"
            columns: ["brand_voice_id"]
            isOneToOne: false
            referencedRelation: "brand_voice_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          content_type: string
          created_at: string
          file_url: string | null
          id: string
          metadata: Json | null
          original_content: string
          source_type: string
          source_url: string | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          content_type: string
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          original_content: string
          source_type: string
          source_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          content_type?: string
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          original_content?: string
          source_type?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          platform: string
          tags: string[] | null
          template_content: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          platform: string
          tags?: string[] | null
          template_content: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          platform?: string
          tags?: string[] | null
          template_content?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      influencer_matches: {
        Row: {
          collaboration_ideas: string[] | null
          contact_info: Json | null
          created_at: string
          engagement_rate: number | null
          follower_count: number | null
          id: string
          influencer_name: string
          match_score: number | null
          niche: string[] | null
          notes: string | null
          platform: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          collaboration_ideas?: string[] | null
          contact_info?: Json | null
          created_at?: string
          engagement_rate?: number | null
          follower_count?: number | null
          id?: string
          influencer_name: string
          match_score?: number | null
          niche?: string[] | null
          notes?: string | null
          platform: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          collaboration_ideas?: string[] | null
          contact_info?: Json | null
          created_at?: string
          engagement_rate?: number | null
          follower_count?: number | null
          id?: string
          influencer_name?: string
          match_score?: number | null
          niche?: string[] | null
          notes?: string | null
          platform?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_analytics: {
        Row: {
          clicks: number | null
          comments: number | null
          created_at: string
          engagement_rate: number | null
          id: string
          likes: number | null
          platform: string
          post_id: string
          recorded_at: string
          shares: number | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          likes?: number | null
          platform: string
          post_id: string
          recorded_at?: string
          shares?: number | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          likes?: number | null
          platform?: string
          post_id?: string
          recorded_at?: string
          shares?: number | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      repurposed_content: {
        Row: {
          content_text: string
          created_at: string
          id: string
          metadata: Json | null
          original_content_id: string
          platform: string
          published_at: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_text: string
          created_at?: string
          id?: string
          metadata?: Json | null
          original_content_id: string
          platform: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_text?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          original_content_id?: string
          platform?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repurposed_content_original_content_id_fkey"
            columns: ["original_content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repurposed_content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          platform: string
          scheduled_date: string
          scheduled_time: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          platform: string
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          platform?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          repurposes_limit: number | null
          repurposes_used: number | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          repurposes_limit?: number | null
          repurposes_used?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          repurposes_limit?: number | null
          repurposes_used?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trend_data: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          platform: string
          related_hashtags: string[] | null
          relevance_score: number | null
          suggested_content: string[] | null
          trend_name: string
          trend_type: string
          user_id: string
          volume_data: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          platform: string
          related_hashtags?: string[] | null
          relevance_score?: number | null
          suggested_content?: string[] | null
          trend_name: string
          trend_type: string
          user_id: string
          volume_data?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          platform?: string
          related_hashtags?: string[] | null
          relevance_score?: number | null
          suggested_content?: string[] | null
          trend_name?: string
          trend_type?: string
          user_id?: string
          volume_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      user_analytics_summary: {
        Row: {
          avg_engagement_rate: number | null
          date: string | null
          platform: string | null
          total_clicks: number | null
          total_comments: number | null
          total_likes: number | null
          total_posts: number | null
          total_shares: number | null
          total_views: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_usage: { Args: { user_email: string }; Returns: boolean }
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
