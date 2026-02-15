-- Unread message tracking
-- Run this in Supabase SQL editor AFTER matchmaking-migration.sql

alter table message_threads add column if not exists starter_unread_count int not null default 0;
alter table message_threads add column if not exists receiver_unread_count int not null default 0;
