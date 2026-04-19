# Tournament Logging with Supabase - Design

## Overview

Allow Pokémon TCG players to log tournaments and track round-by-round results with Supabase backend and user authentication.

## Architecture

- **Backend:** Supabase (PostgreSQL)
- **Authentication:** User auth (sign up / login required)
- **Client:** Next.js App Router with shadcn/ui
- **IDs:** UUIDs via `gen_random_uuid()`

## Data Model

### Tables

**`tournaments`**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `user_id` | UUID | FK → auth.users, NOT NULL |
| `name` | TEXT | NOT NULL |
| `date` | DATE | NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT now() |

**`rounds`**
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `tournament_id` | UUID | FK → tournaments.id, NOT NULL |
| `round_number` | INTEGER | NOT NULL |
| `opponent_deck_archetype` | TEXT | NOT NULL |
| `result` | TEXT | CHECK IN ('win', 'loss'), NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT now() |

### Relationships
- `tournaments.user_id` → `auth.users.id` (users own tournaments)
- `rounds.tournament_id` → `tournaments.id` (cascading delete)

### Row Level Security (RLS)
- Users can only read/write their own tournaments and rounds
- Rounds inherit tournament ownership via foreign key

## Implementation

1. Created SQL migration in `supabase/migrations/20260419120000_create_tournament_tables.sql`
2. Added RLS policies for tournament and rounds tables
3. Created `lib/supabase.ts` for Supabase client
4. Updated `lib/db.ts` to use Supabase client with separate tables
5. Updated `lib/types.ts` with TypeScript interfaces
6. Updated all tournament components to use new data model