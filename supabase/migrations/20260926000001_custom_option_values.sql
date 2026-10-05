-- Stores user-submitted custom titles / service types so they appear
-- in signup and search filter option lists site-wide.
create table if not exists public.custom_option_values (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  value text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (kind, value)
);

alter table public.custom_option_values enable row level security;

create policy "custom_option_values_read_all"
  on public.custom_option_values
  for select
  using (true);

create policy "custom_option_values_insert_authenticated"
  on public.custom_option_values
  for insert
  to authenticated
  with check (created_by = auth.uid());
