create table if not exists avatars (
  id text primary key,
  user_id uuid not null,
  wallet text not null,
  tx_hash text not null,
  created_at timestamptz default now()
);
create table if not exists capsules (
  id uuid primary key default gen_random_uuid(),
  avatar_id text not null references avatars(id) on delete cascade,
  cid text not null,
  key_hex text not null,
  unlock_at timestamptz not null,
  unlocked_at timestamptz,
  status text not null default 'blocked'
);
create table if not exists legacy (
  id uuid primary key default gen_random_uuid(),
  avatar_id text not null references avatars(id) on delete cascade,
  payload_cid text not null,
  rules jsonb not null default '{}'::jsonb,
  status text not null default 'locked',
  created_at timestamptz default now()
);
alter table avatars enable row level security;
alter table capsules enable row level security;
alter table legacy enable row level security;
create policy avatars_own on avatars for select using ( auth.uid() = user_id );
create policy avatars_own_ins on avatars for insert with check ( auth.uid() = user_id );
create policy capsules_own on capsules for select using ( exists(select 1 from avatars a where a.id = avatar_id and a.user_id = auth.uid()) );
create policy legacy_own on legacy for select using ( exists(select 1 from avatars a where a.id = avatar_id and a.user_id = auth.uid()) );
