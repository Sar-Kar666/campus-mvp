-- Add is_read column to messages table
alter table public.messages 
add column if not exists is_read boolean default false;

-- Update RLS policies to allow updating is_read
-- Users can update messages where they are the receiver (to mark as read)
create policy "Users can update received messages" 
on public.messages for update 
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);
