-- Create photos table
create table if not exists public.photos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.photos enable row level security;

-- Policies
create policy "Photos are viewable by everyone." on public.photos for select using (true);
create policy "Users can insert their own photos." on public.photos for insert with check (auth.uid() = user_id);
create policy "Users can delete their own photos." on public.photos for delete using (auth.uid() = user_id);
