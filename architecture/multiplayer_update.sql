-- 1. Fix Foreign Key constraint blocking question insertion
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_author_id_fkey;
ALTER TABLE questions ADD CONSTRAINT questions_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);

ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_host_id_fkey;
ALTER TABLE sessions ADD CONSTRAINT sessions_host_id_fkey FOREIGN KEY (host_id) REFERENCES auth.users(id);

-- 2. Add Join Code to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS join_code VARCHAR UNIQUE;

-- 3. Create Session Guests (Scores) table
CREATE TABLE IF NOT EXISTS session_guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  guest_name VARCHAR NOT NULL,
  score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, guest_name)
);

ALTER TABLE session_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session guests viewable by everyone" ON session_guests FOR SELECT USING (true);
-- Allow anonymous or authenticated to join (insert)
CREATE POLICY "Anyone can insert guest" ON session_guests FOR INSERT WITH CHECK (true);
-- Allow host to update scores
CREATE POLICY "Anyone can update scores" ON session_guests FOR UPDATE USING (true);
