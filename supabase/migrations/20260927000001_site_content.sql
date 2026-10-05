-- Site content managed from the admin dashboard (pages, FAQs, cookie consent).
-- Replaces the previous localStorage-only store so admin edits reach the
-- public site for every visitor.

create table if not exists public.site_content_pages (
  id text primary key,
  slug text not null unique,
  title text not null,
  content text not null default '',
  meta_description text not null default '',
  is_published boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.site_content_faqs (
  id text primary key,
  question text not null,
  answer text not null,
  category text not null default 'General',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.site_content_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content_pages enable row level security;
alter table public.site_content_faqs enable row level security;
alter table public.site_content_settings enable row level security;

-- Public read access: page content is non-sensitive; unpublished rows are
-- filtered client-side as well.
create policy "site_content_pages_read_all"
  on public.site_content_pages for select using (true);

create policy "site_content_faqs_read_all"
  on public.site_content_faqs for select using (true);

create policy "site_content_settings_read_all"
  on public.site_content_settings for select using (true);

-- Only admins can write.
create policy "site_content_pages_write_admin"
  on public.site_content_pages for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "site_content_faqs_write_admin"
  on public.site_content_faqs for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "site_content_settings_write_admin"
  on public.site_content_settings for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
