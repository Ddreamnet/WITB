// Supabase şemasından otomatik üretildi (mcp generate_typescript_types).
// Şema değişince yeniden üret. Elle düzenleme.

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
      members: {
        Row: {
          joined_at: string
          role: string
          space_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role?: string
          space_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'members_space_id_fkey'
            columns: ['space_id']
            isOneToOne: false
            referencedRelation: 'spaces'
            referencedColumns: ['id']
          },
        ]
      }
      nodes: {
        Row: {
          created_at: number
          deleted: boolean
          id: string
          name: string
          name_lower: string
          order: number
          parent_id: string | null
          photo_ids: string[]
          quantity: number
          skip_delete_confirm: boolean
          space_id: string
          updated_at: number
        }
        Insert: {
          created_at: number
          deleted?: boolean
          id: string
          name: string
          name_lower: string
          order?: number
          parent_id?: string | null
          photo_ids?: string[]
          quantity?: number
          skip_delete_confirm?: boolean
          space_id: string
          updated_at: number
        }
        Update: {
          created_at?: number
          deleted?: boolean
          id?: string
          name?: string
          name_lower?: string
          order?: number
          parent_id?: string | null
          photo_ids?: string[]
          quantity?: number
          skip_delete_confirm?: boolean
          space_id?: string
          updated_at?: number
        }
        Relationships: [
          {
            foreignKeyName: 'nodes_space_id_fkey'
            columns: ['space_id']
            isOneToOne: false
            referencedRelation: 'spaces'
            referencedColumns: ['id']
          },
        ]
      }
      photos: {
        Row: {
          created_at: number
          deleted: boolean
          id: string
          space_id: string
          storage_path: string | null
          thumb_path: string | null
          updated_at: number
        }
        Insert: {
          created_at: number
          deleted?: boolean
          id: string
          space_id: string
          storage_path?: string | null
          thumb_path?: string | null
          updated_at: number
        }
        Update: {
          created_at?: number
          deleted?: boolean
          id?: string
          space_id?: string
          storage_path?: string | null
          thumb_path?: string | null
          updated_at?: number
        }
        Relationships: [
          {
            foreignKeyName: 'photos_space_id_fkey'
            columns: ['space_id']
            isOneToOne: false
            referencedRelation: 'spaces'
            referencedColumns: ['id']
          },
        ]
      }
      spaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          join_key: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          join_key: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          join_key?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_space: {
        Args: { p_name: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          join_key: string
          name: string
        }
      }
      gen_join_key: { Args: Record<string, never>; Returns: string }
      is_space_member: { Args: { p_space: string }; Returns: boolean }
      join_space: {
        Args: { p_key: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          join_key: string
          name: string
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
