import { supabase } from './supabase';

export async function getBookingsForTenant(tenant: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('tenant_id', tenant);
  if (error) throw error;
  return data;
}

export async function createBooking(tenant: string, bookingData: { media_id: string; client_email: string; start_date: string; end_date: string }) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ ...bookingData, tenant_id: tenant }])
    .select();
  if (error) throw error;
  return data[0];
}
