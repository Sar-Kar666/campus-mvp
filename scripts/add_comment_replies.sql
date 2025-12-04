-- Add parent_id to comments table for nested replies
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- No new policies needed as existing ones cover insert/select/delete based on user_id
