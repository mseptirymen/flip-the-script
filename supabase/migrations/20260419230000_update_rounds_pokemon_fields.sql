-- Update rounds table to replace opponent_deck_archetype with pokemon fields
ALTER TABLE rounds DROP COLUMN IF EXISTS opponent_deck_archetype;
ALTER TABLE rounds ADD COLUMN opponent_pokemon_1 INTEGER NOT NULL;
ALTER TABLE rounds ADD COLUMN opponent_pokemon_2 INTEGER NOT NULL;