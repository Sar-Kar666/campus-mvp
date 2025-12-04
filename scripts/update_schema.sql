-- Remove foreign key constraint to auth.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Change id to text to support custom IDs (or keep as uuid if we generate valid uuids)
-- For simplicity in this MVP, we'll keep it as UUID but remove the auth dependency.

-- Add phone column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text UNIQUE;

-- Update RLS policies to allow public access (since we are handling auth manually/mock)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;

CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.users FOR UPDATE USING (true);

-- Update Connections RLS
DROP POLICY IF EXISTS "Users can see their own connections." ON public.connections;
DROP POLICY IF EXISTS "Users can create connections." ON public.connections;
DROP POLICY IF EXISTS "Users can update their own connections." ON public.connections;

CREATE POLICY "Enable read access for all users" ON public.connections FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.connections FOR UPDATE USING (true);

-- Update Messages RLS
DROP POLICY IF EXISTS "Users can see their own messages." ON public.messages;
DROP POLICY IF EXISTS "Users can send messages." ON public.messages;

CREATE POLICY "Enable read access for all users" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.messages FOR INSERT WITH CHECK (true);
