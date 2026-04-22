CREATE TABLE IF NOT EXISTS decks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sprite_id_1 INTEGER NOT NULL,
  sprite_id_2 INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own decks" ON decks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);