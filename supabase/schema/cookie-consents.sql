create table public.cookie_consents (
  id uuid primary key,
  browser_id uuid not null,
  choice text not null check (choice in ('accepted', 'rejected')),
  policy_version text not null check (policy_version = '2026-11-05'),
  decided_at timestamptz not null,
  recorded_at timestamptz not null default now()
);
alter table public.cookie_consents enable row level security;
revoke all on public.cookie_consents from public, anon, authenticated;
grant select, insert on public.cookie_consents to service_role;
comment on table public.cookie_consents is 'Append-only cookie choices submitted by browsers; not verified user identities. No email, IP, or user-agent is stored.';

