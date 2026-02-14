-- Moderation & Safety: Reports + Blocks
-- Run this in Supabase SQL editor AFTER matchmaking-migration.sql

-- ── reports ──
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'message', 'user')),
  target_id uuid not null,
  reason text not null,
  details text check (details is null or char_length(details) <= 500)
);

create index if not exists idx_reports_reporter on reports(reporter_id, created_at desc);

-- RLS
alter table reports enable row level security;

-- Users can insert their own reports
create policy "Users can create reports"
  on reports for insert
  with check (auth.uid() = reporter_id);

-- No one can read all reports (service role only).
-- Users cannot select reports at all via client.

-- ── blocks ──
create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  unique(blocker_id, blocked_user_id)
);

create index if not exists idx_blocks_blocker on blocks(blocker_id);

-- RLS
alter table blocks enable row level security;

-- Users can insert their own blocks
create policy "Users can create blocks"
  on blocks for insert
  with check (auth.uid() = blocker_id);

-- Users can read their own blocks
create policy "Users can read own blocks"
  on blocks for select
  using (auth.uid() = blocker_id);

-- Users can delete their own blocks (unblock)
create policy "Users can delete own blocks"
  on blocks for delete
  using (auth.uid() = blocker_id);
