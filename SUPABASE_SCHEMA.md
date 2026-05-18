# Supabase Schema Guide for Snake Leader

When you are ready to enable Multi-device multiplayer, you will need to set up a Supabase project and create the following schema.

## 1. Tables

Create a `games` table to store active game rooms.

```sql
CREATE TABLE games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code varchar(6) UNIQUE NOT NULL, -- e.g. "ABCDEF"
  status varchar(20) DEFAULT 'waiting', -- 'waiting', 'playing', 'finished'
  board jsonb NOT NULL, -- The generated snakes and ladders
  players jsonb NOT NULL, -- Array of player objects
  current_turn_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 2. Realtime Configuration

You need to enable Realtime for the `games` table so that clients can listen to changes.
1. Go to **Database > Replication**.
2. Enable replication for the `games` table.

## 3. Row Level Security (RLS)

To keep things simple for a web game, you can allow anonymous access for now (or set up proper RLS if you add user auth).

```sql
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
ON games FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert access"
ON games FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
ON games FOR UPDATE
TO anon
USING (true);
```

## Next Steps
Once your Supabase project is created:
1. Copy the `Project URL` and `anon public` key.
2. Create a `.env.local` file in the root of your Next.js project.
3. Add the variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
4. Install `@supabase/supabase-js`.
5. I will then integrate `src/lib/supabase.ts` to sync the state instead of local React state!
