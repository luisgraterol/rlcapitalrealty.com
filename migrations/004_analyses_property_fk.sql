-- Nullable so existing analyses are preserved; app logic enforces the association on new saves
alter table property_analyses
  add column property_id uuid references properties(id) on delete set null;
