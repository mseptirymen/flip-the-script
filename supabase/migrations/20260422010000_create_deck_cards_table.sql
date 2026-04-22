CREATE TABLE IF NOT EXISTS deck_cards (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  set_abbreviation TEXT NOT NULL,
  collector_number TEXT NOT NULL,
  rarity TEXT,
  image_url TEXT,
  attack_name TEXT,
  attack_damage TEXT,
  hp INTEGER,
  pokemon_type TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own deck cards"
  ON deck_cards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);