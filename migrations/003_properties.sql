create table properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade,
  landlord_id uuid not null references landlords(id) on delete restrict,
  address_line1 text not null,
  address_line2 text,
  zip_code text not null,
  city text not null,
  neighborhood text,
  notes text
);

alter table properties enable row level security;

create policy "Users manage own properties"
  on properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
