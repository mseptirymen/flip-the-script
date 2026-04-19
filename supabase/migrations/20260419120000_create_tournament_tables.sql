-- Tournament Logging Schema
-- Enable UUID extension for auth.users reference
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Rounds table
CREATE TABLE rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    opponent_deck_archetype TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'loss')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_rounds_tournament_id ON rounds(tournament_id);
CREATE INDEX idx_tournaments_user_id ON tournaments(user_id);

-- Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tournaments
CREATE POLICY "Users can manage their own tournaments"
    ON tournaments
    FOR ALL
    USING (auth.uid() = user_id);

-- Users can only access rounds of their own tournaments
CREATE POLICY "Users can manage rounds of their own tournaments"
    ON rounds
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = rounds.tournament_id
            AND tournaments.user_id = auth.uid()
        )
    );