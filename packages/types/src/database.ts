/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Regenerate with `npm run db:types`, which reads the local Supabase schema.
 * CI fails if the committed output differs from a fresh generation, so editing
 * this by hand will be caught but will waste your time first.
 *
 * This placeholder is replaced the first time the command is run against a
 * database that has migrations applied.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      }
    >;
    Views: Record<string, { Row: Record<string, unknown> }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
  };
}
