create table landlords (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null,
  website text,
  type text not null check (type in (
    'Property Management Company',
    'Individual Investor''s LLC',
    'Small Local RE Company',
    'Regional Portfolio Operator',
    'Institutional Landlord',
    'Real Estate Agent',
    'Turnkey Rental Company',
    'Relocation/Corporate Housing Company'
  )),
  notes text
);

alter table landlords enable row level security;

create policy "Users manage own landlords"
  on landlords for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
