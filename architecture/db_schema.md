# Truth & Dare Database Schema

## tables

### profiles
- `id`: uuid, primary key, references auth.users(id)
- `email`: varchar, unique
- `created_at`: timestamptz

### questions
- `id`: uuid, primary key, default uuid_generate_v4()
- `author_id`: uuid, references profiles(id)
- `category`: text (check category in ('truth', 'dare', 'rapid_fire'))
- `text`: text
- `created_at`: timestamptz

### sessions
- `id`: uuid, primary key, default uuid_generate_v4()
- `host_id`: uuid, references profiles(id)
- `name`: varchar
- `status`: varchar (check status in ('waiting', 'active', 'finished'))
- `created_at`: timestamptz

### RLS Policies
1. `profiles`: Anyone can read profiles. Users can update their own profile.
2. `questions`: Anyone can read questions. Authenticated users can insert questions.
3. `sessions`: Anyone can read sessions. Authenticated users can insert and update their own sessions.
