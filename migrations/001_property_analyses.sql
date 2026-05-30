create table property_analyses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  name text not null,
  address text,
  inputs jsonb not null,
  results jsonb not null,
  notes text
);

-- Enable RLS
alter table property_analyses enable row level security;

-- Allow authenticated users full access
create policy "Authenticated users can do everything"
  on property_analyses
  for all
  using (auth.role() = 'authenticated');
