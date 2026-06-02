import { supabase } from './supabase';

export interface Property {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  landlord_id: string;
  address_line1: string;
  address_line2?: string | null;
  zip_code: string;
  city: string;
  neighborhood?: string | null;
  notes?: string | null;
}

export interface PropertyWithLandlord extends Property {
  landlord: { id: string; name: string } | null;
}

export type PropertyInput = Omit<Property, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export function propertyDisplayAddress(p: Pick<Property, 'address_line1' | 'address_line2' | 'city' | 'zip_code'>): string {
  const parts = [p.address_line1];
  if (p.address_line2) parts.push(p.address_line2);
  parts.push(`${p.city}, ${p.zip_code}`);
  return parts.join(', ');
}

export async function getProperties() {
  return supabase
    .from('properties')
    .select('*, landlord:landlords(id, name)')
    .order('created_at', { ascending: false });
}

export async function createProperty(values: PropertyInput) {
  const { data: { session } } = await supabase.auth.getSession();
  return supabase
    .from('properties')
    .insert([{ ...values, user_id: session?.user.id }])
    .select('*, landlord:landlords(id, name)')
    .single();
}

export async function updateProperty(id: string, values: Partial<PropertyInput>) {
  return supabase
    .from('properties')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, landlord:landlords(id, name)')
    .single();
}

export async function deleteProperty(id: string) {
  return supabase.from('properties').delete().eq('id', id);
}
