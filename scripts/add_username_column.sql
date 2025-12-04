-- Add username column (initially nullable)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;

-- Populate existing users with a default username based on their name or email (sanitized)
-- We'll use a simple strategy: lowercase name with spaces replaced by underscores + random suffix if needed, 
-- but for simplicity in SQL, let's just use 'user_' + first 8 chars of ID to ensure uniqueness for now.
-- Users can change it later.
UPDATE public.users 
SET username = 'user_' || substring(id::text from 1 for 8)
WHERE username IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);

-- Update search index or similar if needed (optional)
