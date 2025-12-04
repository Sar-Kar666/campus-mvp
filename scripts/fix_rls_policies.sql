-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to users (so profiles can be viewed by anyone)
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile (usually handled by triggers, but good to have)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Repeat for other tables if necessary (e.g., posts, comments)
-- Photos should be viewable by everyone
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photos are viewable by everyone"
ON photos FOR SELECT
USING (true);

-- Comments should be viewable by everyone
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);
