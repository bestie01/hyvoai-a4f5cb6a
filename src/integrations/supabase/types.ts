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
      "2": {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
      }
      ai_generated_content: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          id: string
          stream_id: string | null
          used: boolean | null
          user_id: string
        }
        Insert: {
          content_data: Json
          content_type: string
          created_at?: string
          id?: string
          stream_id?: string | null
          used?: boolean | null
          user_id: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          id?: string
          stream_id?: string | null
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          accuracy_score: number | null
          actual_outcome: Json | null
          confidence_score: number | null
          created_at: string
          id: string
          prediction_data: Json
          prediction_type: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          prediction_data: Json
          prediction_type: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          prediction_data?: Json
          prediction_type?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      banned_words: {
        Row: {
          action: string | null
          created_at: string
          id: string
          is_regex: boolean | null
          timeout_duration: number | null
          user_id: string
          word: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: string
          is_regex?: boolean | null
          timeout_duration?: number | null
          user_id: string
          word: string
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: string
          is_regex?: boolean | null
          timeout_duration?: number | null
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      chat_analysis: {
        Row: {
          analyzed_at: string
          created_at: string
          engagement_score: number | null
          highlights: Json | null
          id: string
          message_count: number
          moderation_flags: Json | null
          platform: string
          sentiment: string | null
          stream_id: string
          topics: Json | null
          toxicity_score: number | null
          user_id: string | null
        }
        Insert: {
          analyzed_at?: string
          created_at?: string
          engagement_score?: number | null
          highlights?: Json | null
          id?: string
          message_count?: number
          moderation_flags?: Json | null
          platform: string
          sentiment?: string | null
          stream_id: string
          topics?: Json | null
          toxicity_score?: number | null
          user_id?: string | null
        }
        Update: {
          analyzed_at?: string
          created_at?: string
          engagement_score?: number | null
          highlights?: Json | null
          id?: string
          message_count?: number
          moderation_flags?: Json | null
          platform?: string
          sentiment?: string | null
          stream_id?: string
          topics?: Json | null
          toxicity_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_commands: {
        Row: {
          command: string
          cooldown: number | null
          created_at: string
          id: string
          is_enabled: boolean | null
          permission_level: string | null
          response: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          command: string
          cooldown?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          permission_level?: string | null
          response: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          command?: string
          cooldown?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          permission_level?: string | null
          response?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chat_moderation_actions: {
        Row: {
          action: string
          created_at: string
          id: string
          message: string
          reason: string | null
          stream_id: string
          toxicity_score: number
          user_id: string
          username: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          message: string
          reason?: string | null
          stream_id: string
          toxicity_score: number
          user_id: string
          username: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          message?: string
          reason?: string | null
          stream_id?: string
          toxicity_score?: number
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          is_public: boolean | null
          max_participants: number | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_time?: string | null
          event_type: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_sessions: {
        Row: {
          battery_level: number | null
          device_model: string | null
          id: string
          is_virtual: boolean | null
          language_code: string | null
          manufacturer: string | null
          os_version: string | null
          platform: string | null
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          battery_level?: number | null
          device_model?: string | null
          id?: string
          is_virtual?: boolean | null
          language_code?: string | null
          manufacturer?: string | null
          os_version?: string | null
          platform?: string | null
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          battery_level?: number | null
          device_model?: string | null
          id?: string
          is_virtual?: boolean | null
          language_code?: string | null
          manufacturer?: string | null
          os_version?: string | null
          platform?: string | null
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donor_email: string
          donor_name: string
          id: string
          message: string | null
          stream_id: string | null
          stripe_payment_intent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donor_email: string
          donor_name: string
          id?: string
          message?: string | null
          stream_id?: string | null
          stripe_payment_intent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donor_email?: string
          donor_name?: string
          id?: string
          message?: string | null
          stream_id?: string | null
          stripe_payment_intent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fan_content: {
        Row: {
          content_type: string
          content_url: string
          created_at: string
          description: string | null
          fan_username: string
          id: string
          is_featured: boolean | null
          likes_count: number | null
          streamer_id: string
        }
        Insert: {
          content_type: string
          content_url: string
          created_at?: string
          description?: string | null
          fan_username: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          streamer_id: string
        }
        Update: {
          content_type?: string
          content_url?: string
          created_at?: string
          description?: string | null
          fan_username?: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          streamer_id?: string
        }
        Relationships: []
      }
      platform_streaming_configs: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          platform: string
          rtmp_url: string
          stream_description: string | null
          stream_key: string
          stream_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          platform: string
          rtmp_url: string
          stream_description?: string | null
          stream_key: string
          stream_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          platform?: string
          rtmp_url?: string
          stream_description?: string | null
          stream_key?: string
          stream_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          selected_option: number
          voter_identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          selected_option: number
          voter_identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          selected_option?: number
          voter_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "stream_polls"
            referencedColumns: ["id"]
          },
        ]
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
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_id: string
          reward_amount: number | null
          reward_claimed: boolean | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_id: string
          reward_amount?: number | null
          reward_claimed?: boolean | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_amount?: number | null
          reward_claimed?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string
          error_message: string | null
          id: string
          media_urls: string[] | null
          platform: string
          posted_at: string | null
          scheduled_time: string
          status: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          platform: string
          posted_at?: string | null
          scheduled_time: string
          status?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          posted_at?: string | null
          scheduled_time?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stream_analytics: {
        Row: {
          created_at: string
          duration: string
          engagement_rate: number
          id: string
          messages: number
          platform: string
          quality: string
          stream_id: string
          timestamp: string
          user_id: string
          viewers: number
        }
        Insert: {
          created_at?: string
          duration: string
          engagement_rate?: number
          id?: string
          messages?: number
          platform: string
          quality: string
          stream_id: string
          timestamp?: string
          user_id: string
          viewers?: number
        }
        Update: {
          created_at?: string
          duration?: string
          engagement_rate?: number
          id?: string
          messages?: number
          platform?: string
          quality?: string
          stream_id?: string
          timestamp?: string
          user_id?: string
          viewers?: number
        }
        Relationships: []
      }
      stream_clips: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          file_path: string
          id: string
          stream_id: string
          thumbnail_url: string | null
          title: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_path: string
          id?: string
          stream_id: string
          thumbnail_url?: string | null
          title: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_path?: string
          id?: string
          stream_id?: string
          thumbnail_url?: string | null
          title?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      stream_health_metrics: {
        Row: {
          bitrate: number | null
          connection_quality: string | null
          cpu_usage: number | null
          dropped_frames: number | null
          fps: number | null
          id: string
          memory_usage: number | null
          network_latency: number | null
          stream_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          bitrate?: number | null
          connection_quality?: string | null
          cpu_usage?: number | null
          dropped_frames?: number | null
          fps?: number | null
          id?: string
          memory_usage?: number | null
          network_latency?: number | null
          stream_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          bitrate?: number | null
          connection_quality?: string | null
          cpu_usage?: number | null
          dropped_frames?: number | null
          fps?: number | null
          id?: string
          memory_usage?: number | null
          network_latency?: number | null
          stream_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      stream_highlights: {
        Row: {
          created_at: string
          generated_at: string
          highlights: Json
          id: string
          stream_id: string
          summary: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          generated_at?: string
          highlights?: Json
          id?: string
          stream_id: string
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          generated_at?: string
          highlights?: Json
          id?: string
          stream_id?: string
          summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stream_locations: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          latitude: number
          location_name: string | null
          longitude: number
          stream_id: string | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude: number
          location_name?: string | null
          longitude: number
          stream_id?: string | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude?: number
          location_name?: string | null
          longitude?: number
          stream_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stream_polls: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string | null
          id: string
          options: Json
          question: string
          stream_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          question: string
          stream_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          question?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: []
      }
      stream_scenes: {
        Row: {
          config: Json
          created_at: string
          hotkey: string | null
          id: string
          is_default: boolean | null
          name: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          hotkey?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          hotkey?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stream_schedules: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          platform: string
          scheduled_start_time: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          platform: string
          scheduled_start_time: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          platform?: string
          scheduled_start_time?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stream_settings: {
        Row: {
          background_removed: boolean | null
          bitrate: number | null
          created_at: string
          fps: number | null
          id: string
          notification_email: boolean | null
          notification_push: boolean | null
          resolution: string | null
          twitch_api_key: string | null
          updated_at: string
          user_id: string
          youtube_api_key: string | null
        }
        Insert: {
          background_removed?: boolean | null
          bitrate?: number | null
          created_at?: string
          fps?: number | null
          id?: string
          notification_email?: boolean | null
          notification_push?: boolean | null
          resolution?: string | null
          twitch_api_key?: string | null
          updated_at?: string
          user_id: string
          youtube_api_key?: string | null
        }
        Update: {
          background_removed?: boolean | null
          bitrate?: number | null
          created_at?: string
          fps?: number | null
          id?: string
          notification_email?: boolean | null
          notification_push?: boolean | null
          resolution?: string | null
          twitch_api_key?: string | null
          updated_at?: string
          user_id?: string
          youtube_api_key?: string | null
        }
        Relationships: []
      }
      stream_vods: {
        Row: {
          created_at: string
          duration: number | null
          file_path: string
          id: string
          stream_id: string
          thumbnail_url: string | null
          title: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_path: string
          id?: string
          stream_id: string
          thumbnail_url?: string | null
          title: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_path?: string
          id?: string
          stream_id?: string
          thumbnail_url?: string | null
          title?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      streams: {
        Row: {
          created_at: string
          id: number
          is_live: boolean | null
          livepeer_id: string | null
          playback_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_live?: boolean | null
          livepeer_id?: string | null
          playback_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_live?: boolean | null
          livepeer_id?: string | null
          playback_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      viewer_engagement: {
        Row: {
          created_at: string
          id: string
          message_count: number | null
          points: number | null
          stream_id: string
          updated_at: string
          user_id: string
          viewer_identifier: string
          watch_time: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_count?: number | null
          points?: number | null
          stream_id: string
          updated_at?: string
          user_id: string
          viewer_identifier: string
          watch_time?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          message_count?: number | null
          points?: number | null
          stream_id?: string
          updated_at?: string
          user_id?: string
          viewer_identifier?: string
          watch_time?: number | null
        }
        Relationships: []
      }
      viewer_qa_knowledge: {
        Row: {
          answer: string
          auto_respond: boolean | null
          created_at: string
          id: string
          question: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          answer: string
          auto_respond?: boolean | null
          created_at?: string
          id?: string
          question: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          answer?: string
          auto_respond?: boolean | null
          created_at?: string
          id?: string
          question?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      vip_users: {
        Row: {
          expires_at: string | null
          granted_at: string
          id: string
          notes: string | null
          user_id: string
          vip_platform: string
          vip_username: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          user_id: string
          vip_platform: string
          vip_username: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          user_id?: string
          vip_platform?: string
          vip_username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_service_role: { Args: never; Returns: boolean }
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
