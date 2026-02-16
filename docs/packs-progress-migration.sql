-- Pack progress tracking
-- Run this in Supabase SQL editor

create table if not exists pack_progress (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_id text not null,
  completed_drill_ids text[] not null default '{}',
  last_started_at timestamptz,
  unique (user_id, pack_id)
);

-- Enable RLS
alter table pack_progress enable row level security;

-- Users can only access their own rows
create policy "Users select own pack_progress"
  on pack_progress for select
  using (user_id = auth.uid());

create policy "Users insert own pack_progress"
  on pack_progress for insert
  with check (user_id = auth.uid());

create policy "Users update own pack_progress"
  on pack_progress for update
  using (user_id = auth.uid());

create policy "Users delete own pack_progress"
  on pack_progress for delete
  using (user_id = auth.uid());
