'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function SettingsPage() {
  const [tenantDetails, setTenantDetails] = useState({
    id: '',
    name: '',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/auth';
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Unable to fetch user profile');
      }

      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (tenantError || !tenantData) {
        throw new Error('Unable to fetch tenant details');
      }

      setTenantDetails(tenantData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      let logoUrl = tenantDetails.logo_url;

      if (logoFile) {
        const filePath = `logos/${Date.now()}_${logoFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('media-images')
          .upload(filePath, logoFile);

        if (uploadError) {
          throw new Error('Failed to upload logo');
        }

        const { data: publicUrlData } = supabase.storage
          .from('media-images')
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error('Failed to retrieve public URL for the uploaded image');
        }

        logoUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          name: tenantDetails.name,
          logo_url: logoUrl,
          contact_email: tenantDetails.contact_email,
          contact_phone: tenantDetails.contact_phone,
          contact_address: tenantDetails.contact_address,
        })
        .eq('id', tenantDetails.id);

      if (updateError) {
        throw new Error('Failed to update tenant details');
      }

      setSuccessMessage('Tenant details updated successfully!');
      fetchTenantDetails();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tenant Settings</h1>

      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
          <input
            type="text"
            value={tenantDetails.name}
            onChange={(e) => setTenantDetails({ ...tenantDetails, name: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            value={tenantDetails.contact_email}
            onChange={(e) =>
              setTenantDetails({ ...tenantDetails, contact_email: e.target.value })
            }
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="text"
            value={tenantDetails.contact_phone}
            onChange={(e) =>
              setTenantDetails({ ...tenantDetails, contact_phone: e.target.value })
            }
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Address</label>
          <textarea
            value={tenantDetails.contact_address}
            onChange={(e) =>
              setTenantDetails({ ...tenantDetails, contact_address: e.target.value })
            }
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <button
          type="button"
          onClick={handleUpdateDetails}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
