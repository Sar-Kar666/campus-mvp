-- Insert the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('user-photos', 'user-photos', true)
on conflict (id) do nothing;

-- Set up RLS policies for the bucket
-- Note: We need to drop existing policies to avoid conflicts if re-running
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can update their own images" on storage.objects;
drop policy if exists "Users can delete their own images" on storage.objects;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'user-photos' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'user-photos' and auth.role() = 'authenticated' );

create policy "Users can update their own images"
  on storage.objects for update
  using ( bucket_id = 'user-photos' and auth.uid() = owner )
  with check ( bucket_id = 'user-photos' and auth.uid() = owner );

create policy "Users can delete their own images"
  on storage.objects for delete
  using ( bucket_id = 'user-photos' and auth.uid() = owner );
