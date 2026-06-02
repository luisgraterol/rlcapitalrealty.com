-- Replace per-user RLS policies with shared-workspace policies so all
-- authenticated users can read and write each other's landlords and properties.

drop policy if exists "Users manage own landlords"  on landlords;
drop policy if exists "Users manage own properties" on properties;

create policy "Authenticated users can manage landlords"
  on landlords for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can manage properties"
  on properties for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
