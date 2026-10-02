export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      game_invitations: {
        Row: {
          created_at: string;
          game_id: string;
          id: string;
          invitee_id: string;
          inviter_id: string;
          responded_at: string | null;
          status: Database['public']['Enums']['game_invitation_status'];
        };
        Insert: {
          created_at?: string;
          game_id: string;
          id?: string;
          invitee_id: string;
          inviter_id: string;
          responded_at?: string | null;
          status?: Database['public']['Enums']['game_invitation_status'];
        };
        Update: {
          created_at?: string;
          game_id?: string;
          id?: string;
          invitee_id?: string;
          inviter_id?: string;
          responded_at?: string | null;
          status?: Database['public']['Enums']['game_invitation_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'game_invitations_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'game_invitations_invitee_id_fkey';
            columns: ['invitee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'game_invitations_inviter_id_fkey';
            columns: ['inviter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      game_participants: {
        Row: {
          game_id: string;
          joined_at: string;
          player_id: string;
          position: number;
          role: Database['public']['Enums']['game_participant_role'];
        };
        Insert: {
          game_id: string;
          joined_at?: string;
          player_id: string;
          position: number;
          role: Database['public']['Enums']['game_participant_role'];
        };
        Update: {
          game_id?: string;
          joined_at?: string;
          player_id?: string;
          position?: number;
          role?: Database['public']['Enums']['game_participant_role'];
        };
        Relationships: [
          {
            foreignKeyName: 'game_participants_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'game_participants_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      game_result_sets: {
        Row: {
          game_id: string;
          set_number: number;
          team_one_score: number;
          team_two_score: number;
        };
        Insert: {
          game_id: string;
          set_number: number;
          team_one_score: number;
          team_two_score: number;
        };
        Update: {
          game_id?: string;
          set_number?: number;
          team_one_score?: number;
          team_two_score?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'game_result_sets_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'game_results';
            referencedColumns: ['game_id'];
          },
        ];
      };
      game_result_teams: {
        Row: {
          game_id: string;
          player_id: string;
          player_position: number;
          team_number: number;
        };
        Insert: {
          game_id: string;
          player_id: string;
          player_position: number;
          team_number: number;
        };
        Update: {
          game_id?: string;
          player_id?: string;
          player_position?: number;
          team_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'game_result_teams_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'game_results';
            referencedColumns: ['game_id'];
          },
          {
            foreignKeyName: 'game_result_teams_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      game_results: {
        Row: {
          created_at: string;
          game_id: string;
          submitted_by: string;
        };
        Insert: {
          created_at?: string;
          game_id: string;
          submitted_by: string;
        };
        Update: {
          created_at?: string;
          game_id?: string;
          submitted_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'game_results_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: true;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'game_results_submitted_by_fkey';
            columns: ['submitted_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      games: {
        Row: {
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          duration_minutes: number;
          ended_at: string | null;
          format: Database['public']['Enums']['game_format'];
          id: string;
          name: string;
          organiser_id: string;
          starts_at: string;
          status: Database['public']['Enums']['game_status'];
          updated_at: string;
          venue_name: string;
        };
        Insert: {
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          duration_minutes: number;
          ended_at?: string | null;
          format: Database['public']['Enums']['game_format'];
          id?: string;
          name: string;
          organiser_id: string;
          starts_at: string;
          status?: Database['public']['Enums']['game_status'];
          updated_at?: string;
          venue_name: string;
        };
        Update: {
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          duration_minutes?: number;
          ended_at?: string | null;
          format?: Database['public']['Enums']['game_format'];
          id?: string;
          name?: string;
          organiser_id?: string;
          starts_at?: string;
          status?: Database['public']['Enums']['game_status'];
          updated_at?: string;
          venue_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'games_organiser_id_fkey';
            columns: ['organiser_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      player_favourites: {
        Row: {
          created_at: string;
          player_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          player_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          player_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_favourites_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'player_favourites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          availability_days: string[];
          availability_times: string[];
          avatar_url: string | null;
          bio: string;
          created_at: string;
          display_name: string;
          games_played: number;
          games_won: number;
          home_location: string;
          id: string;
          initials: string;
          level: Database['public']['Enums']['player_level'];
          onboarding_completed_at: string | null;
          play_vibe: string | null;
          preferred_days: string;
          preferred_side: Database['public']['Enums']['player_side'];
          preferred_time_of_day: string;
          presence: Database['public']['Enums']['player_presence'];
          rating: number;
          updated_at: string;
          weekly_frequency: string | null;
        };
        Insert: {
          availability_days?: string[];
          availability_times?: string[];
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          display_name: string;
          games_played?: number;
          games_won?: number;
          home_location?: string;
          id: string;
          initials: string;
          level?: Database['public']['Enums']['player_level'];
          onboarding_completed_at?: string | null;
          play_vibe?: string | null;
          preferred_days?: string;
          preferred_side?: Database['public']['Enums']['player_side'];
          preferred_time_of_day?: string;
          presence?: Database['public']['Enums']['player_presence'];
          rating?: number;
          updated_at?: string;
          weekly_frequency?: string | null;
        };
        Update: {
          availability_days?: string[];
          availability_times?: string[];
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          display_name?: string;
          games_played?: number;
          games_won?: number;
          home_location?: string;
          id?: string;
          initials?: string;
          level?: Database['public']['Enums']['player_level'];
          onboarding_completed_at?: string | null;
          play_vibe?: string | null;
          preferred_days?: string;
          preferred_side?: Database['public']['Enums']['player_side'];
          preferred_time_of_day?: string;
          presence?: Database['public']['Enums']['player_presence'];
          rating?: number;
          updated_at?: string;
          weekly_frequency?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_game: {
        Args: {
          duration_minutes: number;
          format: Database['public']['Enums']['game_format'];
          game_name: string;
          starts_at: string;
          venue_name: string;
        };
        Returns: string;
      };
      join_game: { Args: { game_id: string }; Returns: string };
      leave_game: { Args: { game_id: string }; Returns: string };
      profile_initials: { Args: { display_name: string }; Returns: string };
      reschedule_game: {
        Args: { game_id: string; starts_at: string };
        Returns: string;
      };
      respond_to_game_invitation: {
        Args: { invitation_id: string; response: string };
        Returns: string;
      };
      send_game_invitation: {
        Args: { game_id: string; player_id: string };
        Returns: string;
      };
      set_player_favourite: {
        Args: { player_id: string; should_favourite: boolean };
        Returns: string;
      };
      transition_game_lifecycle: {
        Args: {
          game_id: string;
          lifecycle_command: string;
          occurred_at: string;
          result_data?: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      game_format: 'Social game' | 'Competitive game';
      game_invitation_status: 'pending' | 'accepted' | 'declined' | 'closed';
      game_participant_role: 'organiser' | 'player';
      game_status: 'scheduled' | 'awaiting_result' | 'completed' | 'cancelled';
      player_level: 'Beginner' | 'Improver' | 'Intermediate' | 'Advanced';
      player_presence: 'online' | 'away' | 'offline';
      player_side: 'Left' | 'Right' | 'Either';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      game_format: ['Social game', 'Competitive game'],
      game_invitation_status: ['pending', 'accepted', 'declined', 'closed'],
      game_participant_role: ['organiser', 'player'],
      game_status: ['scheduled', 'awaiting_result', 'completed', 'cancelled'],
      player_level: ['Beginner', 'Improver', 'Intermediate', 'Advanced'],
      player_presence: ['online', 'away', 'offline'],
      player_side: ['Left', 'Right', 'Either'],
    },
  },
} as const;
