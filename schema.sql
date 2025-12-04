-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- USERS TABLE
create table public.users (
  id uuid references auth.users not null primary key,
  name text not null,
  college text not null,
  branch text not null,
  year text not null,
  bio text,
  interests text[] default '{}',
  profile_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.users enable row level security;
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can insert their own profile." on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

-- CONNECTIONS TABLE
create table public.connections (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.users(id) not null,
  receiver_id uuid references public.users(id) not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(requester_id, receiver_id)
);
alter table public.connections enable row level security;
create policy "Users can see their own connections." on public.connections for select using (auth.uid() = requester_id or auth.uid() = receiver_id);
create policy "Users can create connections." on public.connections for insert with check (auth.uid() = requester_id);
create policy "Users can update their own connections." on public.connections for update using (auth.uid() = receiver_id or auth.uid() = requester_id);

-- MESSAGES TABLE
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id) not null,
  receiver_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.messages enable row level security;
create policy "Users can see their own messages." on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages." on public.messages for insert with check (auth.uid() = sender_id);
