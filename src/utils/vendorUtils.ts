import { supabase } from '../lib/supabaseClient';
import { Vendor } from '../types/purchases';

export const addVendor = async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> => {
  const { data, error } = await supabase
    .from('vendors')
    .insert([vendor])
    .select()
    .single();

  if (error) {
    console.error('Error adding vendor:', error);
    throw error;
  }

  return data;
};

export const updateVendor = async (id: number, vendor: Partial<Omit<Vendor, 'id' | 'created_at' | 'updated_at'>>): Promise<Vendor> => {
  const { data, error } = await supabase
    .from('vendors')
    .update(vendor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }

  return data;
};

export const deleteVendor = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

export const fetchVendors = async (): Promise<Vendor[]> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }

  return data || [];
};
