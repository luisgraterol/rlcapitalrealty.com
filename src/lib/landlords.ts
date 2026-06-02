import { supabase } from './supabase';

export interface Landlord {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  website?: string | null;
  type: string;
  notes?: string | null;
}

export const LANDLORD_TYPES = [
  'Property Management Company',
  "Individual Investor's LLC",
  'Small Local RE Company',
  'Regional Portfolio Operator',
  'Institutional Landlord',
  'Real Estate Agent',
  'Turnkey Rental Company',
  'Relocation/Corporate Housing Company',
] as const;

export type LandlordInput = Omit<Landlord, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export async function getLandlords() {
  return supabase
    .from('landlords')
    .select('*')
    .order('name', { ascending: true });
}

export async function createLandlord(values: LandlordInput) {
  const { data: { session } } = await supabase.auth.getSession();
  return supabase
    .from('landlords')
    .insert([{ ...values, user_id: session?.user.id }])
    .select()
    .single();
}

export async function updateLandlord(id: string, values: Partial<LandlordInput>) {
  return supabase
    .from('landlords')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

export async function deleteLandlord(id: string) {
  return supabase.from('landlords').delete().eq('id', id);
}
