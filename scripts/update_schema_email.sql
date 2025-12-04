-- Remove phone column and add email column
ALTER TABLE public.users DROP COLUMN IF EXISTS phone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text UNIQUE;
