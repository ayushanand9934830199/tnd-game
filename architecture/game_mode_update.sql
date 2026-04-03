ALTER TABLE sessions ADD COLUMN IF NOT EXISTS game_mode VARCHAR DEFAULT 'tnd' CHECK (game_mode IN ('tnd', 'rapid_fire'));
