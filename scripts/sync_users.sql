-- Insert missing users from auth.users into public.users
INSERT INTO public.users (id, name, college, branch, year, email, created_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'name', 'New User') as name,
    COALESCE(raw_user_meta_data->>'college', 'Unknown') as college,
    COALESCE(raw_user_meta_data->>'branch', 'Unknown') as branch,
    COALESCE(raw_user_meta_data->>'year', '1st') as year,
    email,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
