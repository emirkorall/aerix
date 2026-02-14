-- Matchmaking MVP: LFG Posts + Messaging
-- Run this in Supabase SQL editor

-- ── lfg_posts ──
create table if not exists lfg_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  looking_for text not null check (looking_for in ('duo', 'trio')),
  rank text not null,
  playlist text not null,
  region text not null check (region in ('NA', 'EU', 'OCE', 'SAM', 'ME', 'ASIA')),
  note text not null default '',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_lfg_posts_status on lfg_posts(status, created_at desc);
create index if not exists idx_lfg_posts_user on lfg_posts(user_id, status);

-- RLS
alter table lfg_posts enable row level security;

-- Anyone signed in can read open posts
create policy "Anyone can read open posts"
  on lfg_posts for select
  using (status = 'open');

-- Users can read their own posts (any status)
create policy "Users can read own posts"
  on lfg_posts for select
  using (auth.uid() = user_id);

-- Users can insert their own posts
create policy "Users can create posts"
  on lfg_posts for insert
  with check (auth.uid() = user_id);

-- Users can update (close) their own posts
create policy "Users can update own posts"
  on lfg_posts for update
  using (auth.uid() = user_id);

-- ── message_threads ──
create table if not exists message_threads (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references lfg_posts(id) on delete cascade,
  starter_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique(post_id, starter_id)
);

create index if not exists idx_threads_starter on message_threads(starter_id);
create index if not exists idx_threads_receiver on message_threads(receiver_id);

-- RLS
alter table message_threads enable row level security;

-- Participants can read their threads
create policy "Participants can read threads"
  on message_threads for select
  using (auth.uid() = starter_id or auth.uid() = receiver_id);

-- Starter can create threads
create policy "Starter can create threads"
  on message_threads for insert
  with check (auth.uid() = starter_id);

-- Participants can update threads (for last_message)
create policy "Participants can update threads"
  on message_threads for update
  using (auth.uid() = starter_id or auth.uid() = receiver_id);

-- ── messages ──
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_thread on messages(thread_id, created_at);

-- RLS
alter table messages enable row level security;

-- Thread participants can read messages
create policy "Thread participants can read messages"
  on messages for select
  using (
    exists (
      select 1 from message_threads t
      where t.id = thread_id
      and (t.starter_id = auth.uid() or t.receiver_id = auth.uid())
    )
  );

-- Thread participants can send messages
create policy "Thread participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from message_threads t
      where t.id = thread_id
      and (t.starter_id = auth.uid() or t.receiver_id = auth.uid())
    )
  );

-- ── Allow lfg_posts to join on profiles for display_name ──
-- (profiles table should already exist from auth setup)
-- Make sure profiles has a select policy for authenticated users:
-- create policy "Anyone can read profiles" on profiles for select using (true);
