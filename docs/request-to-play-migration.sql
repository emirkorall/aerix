-- Request to Play handshake for matchmaking threads
-- Run this in Supabase SQL editor AFTER matchmaking-migration.sql

-- Add status column with check constraint
alter table message_threads add column if not exists status text not null default 'pending';
alter table message_threads add column if not exists requested_at timestamptz default now();
alter table message_threads add column if not exists responded_at timestamptz;

-- Add check constraint for status values
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'message_threads_status_check'
  ) then
    alter table message_threads add constraint message_threads_status_check
      check (status in ('pending', 'accepted', 'declined'));
  end if;
end $$;
