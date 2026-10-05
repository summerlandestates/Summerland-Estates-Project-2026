-- Tables behind the "Apply to Open Roles" and "Bid on Service Requests"
-- features (monthly caps enforced in the UI count rows here).

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_posting_id uuid,
  applicant_id uuid references auth.users(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  cover_letter text,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table if not exists public.service_bids (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid,
  bidder_id uuid references auth.users(id) on delete cascade,
  bidder_name text not null,
  bidder_email text not null,
  bidder_phone text,
  quote_amount numeric not null,
  message text,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

alter table public.job_applications enable row level security;
alter table public.service_bids enable row level security;

-- Anyone signed in can apply; applicants see their own applications, and the
-- job poster sees applications to their postings.
create policy "job_applications_insert_auth"
  on public.job_applications for insert to authenticated
  with check (applicant_id = auth.uid());

create policy "job_applications_select_own_or_owner"
  on public.job_applications for select to authenticated
  using (
    applicant_id = auth.uid()
    or exists (
      select 1 from public.job_postings j
      where j.id = job_posting_id and j.user_id = auth.uid()
    )
  );

create policy "service_bids_insert_auth"
  on public.service_bids for insert to authenticated
  with check (bidder_id = auth.uid());

create policy "service_bids_select_own_or_owner"
  on public.service_bids for select to authenticated
  using (
    bidder_id = auth.uid()
    or exists (
      select 1 from public.service_requests s
      where s.id = service_request_id and s.user_id = auth.uid()
    )
  );
