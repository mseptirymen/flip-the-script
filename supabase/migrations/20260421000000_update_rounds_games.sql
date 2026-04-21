-- Update rounds table to use games array instead of single result
ALTER TABLE rounds DROP COLUMN IF EXISTS result;
ALTER TABLE rounds ADD COLUMN games JSONB NOT NULL DEFAULT '[]'::jsonb;
