-- 1. Ensure parent_id column exists
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. Enable RLS (just in case)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing insert policy to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;

-- 4. Create a permissive insert policy for authenticated users
-- We use "TO authenticated" to ensure only logged-in users can comment
-- We relax the check slightly to "true" to prevent ID mismatch issues during dev, 
-- or stick to strict check if we trust the session. 
-- Let's use the strict check first, but ensure the policy is applied to 'authenticated' role.
CREATE POLICY "Users can insert their own comments" ON public.comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Ensure select policy exists
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

-- 6. Grant permissions (sometimes needed)
GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.comments TO anon;
