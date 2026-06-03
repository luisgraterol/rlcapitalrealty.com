alter table properties
  add column if not exists bedrooms      integer,
  add column if not exists bathrooms     numeric(3,1),
  add column if not exists property_type text;