import { supabase } from './supabase';

export async function getMediaForTenant(tenant: string) {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('tenant_id', tenant);
  if (error) throw error;
  return data;
}

export async function createMedia(tenant: string, mediaData: { name: string; location: string; price: number; }) {
  const { data, error } = await supabase
    .from('media')
    .insert([{ ...mediaData, tenant_id: tenant }])
    .select();
  if (error) throw error;
  return data[0];
}

// Similarly implement updateMedia, deleteMedia
