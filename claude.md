# Project Constitution

## Data Schemas
(Refer to `gemini.md` for specific JSON shapes)
- Profiles: Basic user info tied to auth.
- Questions: Repository of truths, dares, and rapid-fire questions added by users.
- Sessions: Game sessions managed by the host.

## Behavioral Rules
1. **Screen-Share First:** The app is primarily designed for screen sharing over Google Meet. The UI should have high contrast, large text, and dynamic styling that looks good on video.
2. **Deterministic State:** Only registered users (hosts) can create questions and start sessions.
3. **No Unknowns:** No external APIs besides Supabase and basic web app dependencies.

## Architectural Invariants
1. Obey the 3-Layer Architecture.
2. Changes to logic must reflect in SOPs (`architecture/`) first, then tools.
3. **Frontend:** React using modern UI design (glassmorphism, vibrant colors).
4. **Backend/Database:** Supabase (Auth, Postgres).
