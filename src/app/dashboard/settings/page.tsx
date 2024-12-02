'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function SettingsPage() {
  const [tenantDetails, setTenantDetails] = useState({
    name: '',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
  }); // Tenant details state
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error state
  const [successMessage, setSuccessMessage] = useState(''); // Success state

  // Fetch tenant details
  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found. Redirecting to auth.');
        window.location.href = '/auth';
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Unable to fetch user profile');
      }

      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (tenantError || !tenantData) {
        console.error('Error fetching tenant details:', tenantError);
        throw new Error('Unable to fetch tenant details');
      }

      setTenantDetails(tenantData);
    } catch (err) {
      console.error('Error in fetchTenantDetails:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update tenant details
  const handleUpdateDetails = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

// Upload images
for (const image of newImages) {
    try {
      // Generate unique file path for the image
      const filePath = `${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
      console.log('Uploading image with filePath:', filePath);
  
      // Upload the image to the specified storage bucket
      const { error: uploadError } = await supabase.storage
        .from('media-images') // Change to your bucket name if different
        .upload(filePath, image);
  
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error(`Failed to upload image: ${image.name}`);
      }
  
      console.log(`Image uploaded successfully: ${filePath}`);
  
      // Fetch the public URL for the uploaded image
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from('media-images') // Change to your bucket name if different
        .getPublicUrl(filePath);
  
      if (publicUrlError || !publicUrlData) {
        console.error('Error fetching public URL:', publicUrlError);
        throw new Error('Failed to retrieve public URL for the uploaded image');
      }
  
      console.log('Image Public URL:', publicUrlData.publicUrl);
  
      // Insert the image's public URL into the database
      const { error: insertImageError } = await supabase.from('media_images').insert({
        media_id: insertedMedia.id, // Ensure `insertedMedia.id` is properly set
        image_url: publicUrlData.publicUrl,
      });
  
      if (insertImageError) {
        console.error('Error inserting image URL into database:', insertImageError);
        throw new Error(`Failed to save image URL for ${filePath} in the database`);
      }
  
      console.log(`Image URL inserted into database successfully for: ${filePath}`);
    } catch (err) {
      console.error('Error processing image upload:', err.message);
      alert(`Error uploading image: ${err.message}`);
    }
  }
  
  console.log('All images processed successfully.');
  

      // Update tenant details
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
        console.error('Error updating tenant details:', updateError);
        throw new Error('Failed to update tenant details');
      }

      setSuccessMessage('Tenant details updated successfully!');
      fetchTenantDetails(); // Refresh data
    } catch (err) {
      console.error('Error in handleUpdateDetails:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tenant Settings</h1>

      {successMessage && (
        <div className="text-green-500 mb-4">{successMessage}</div>
      )}
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
          <input
            type="text"
            value={tenantDetails.name || ''}
            onChange={(e) =>
              setTenantDetails({ ...tenantDetails, name: e.target.value })
            }
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            value={tenantDetails.contact_email || ''}
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
            value={tenantDetails.contact_phone || ''}
            onChange={(e) =>
              setTenantDetails({ ...tenantDetails, contact_phone: e.target.value })
            }
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Address</label>
          <textarea
            value={tenantDetails.contact_address || ''}
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
