'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import FloatingSidebar from '@/components/ui/FloatingSidebar';

export default function MediaPage() {
  const [media, setMedia] = useState([]); // Media list
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error messages
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state
  const [uploadError, setUploadError] = useState(''); // Error for image upload

  const [newMedia, setNewMedia] = useState({
    name: '',
    type: '',
    location: '',
    price: '',
    availability: true,
  });
  const [newImages, setNewImages] = useState<File[]>([]); // Images for upload

  // Fetch media items for the tenant
  const fetchMedia = async () => {
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

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select(`
          *,
          media_images (image_url)
        `)
        .eq('tenant_id', profile.tenant_id);

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
        throw new Error('Unable to fetch media');
      }

      setMedia(mediaData || []);
      console.log('Fetched media:', mediaData);
    } catch (err) {
      console.error('Error in fetchMedia:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new media with image uploads
  const handleAddMedia = async () => {
    try {
      setUploadError('');
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

      // Insert new media record
      const { data: insertedMedia, error: insertError } = await supabase
        .from('media')
        .insert({
          ...newMedia,
          tenant_id: profile.tenant_id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting media:', insertError);
        throw new Error('Failed to insert media');
      }

      console.log('Inserted media:', insertedMedia);

      // Upload images
      for (const image of newImages) {
        const filePath = `${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
        console.log('Uploading image with filePath:', filePath);

        const { error: uploadError } = await supabase.storage
          .from('media-images')
          .upload(filePath, image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Failed to upload image');
        }

        // Get the public URL
        const { data: publicUrlData, error: publicUrlError } = supabase.storage
          .from('media-images')
          .getPublicUrl(filePath);

        if (publicUrlError || !publicUrlData) {
          console.error('Error fetching public URL:', publicUrlError);
          throw new Error('Failed to retrieve image public URL');
        }

        console.log('Image uploaded. Public URL:', publicUrlData.publicUrl);

        // Insert image URL into database
        const { error: insertImageError } = await supabase.from('media_images').insert({
          media_id: insertedMedia.id,
          image_url: publicUrlData.publicUrl,
        });

        if (insertImageError) {
          console.error('Error inserting image URL:', insertImageError);
          throw new Error('Failed to save image URL in database');
        }

        console.log('Image URL inserted into database.');
      }

      console.log('All images uploaded successfully.');

      // Reset form and refresh data
      setIsSidebarOpen(false);
      setNewMedia({ name: '', type: '', location: '', price: '', availability: true });
      setNewImages([]);
      fetchMedia();
    } catch (err) {
      console.error('Error in handleAddMedia:', err.message);
      setUploadError(err.message);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Media</h1>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600"
      >
        Add New Media
      </button>
      <ul className="space-y-4">
        {media.map((item) => (
          <li key={item.id} className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p>Type: {item.type}</p>
            <p>Location: {item.location}</p>
            <p>Price: ${item.price}</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Images</h3>
              <div className="flex space-x-4">
                {item.media_images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.image_url}
                    alt={`Media ${item.name}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {uploadError && <div className="text-red-500">{uploadError}</div>}

      <FloatingSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Add New Media</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={newMedia.name}
            onChange={(e) => setNewMedia({ ...newMedia, name: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Type"
            value={newMedia.type}
            onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={newMedia.price}
            onChange={(e) => setNewMedia({ ...newMedia, price: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <div>
            <label>Upload Images</label>
            <input
              type="file"
              multiple
              onChange={(e) => setNewImages(Array.from(e.target.files || []))}
            />
          </div>
          <button
            onClick={handleAddMedia}
            className="px-4 py-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600"
          >
            Add Media
          </button>
        </div>
      </FloatingSidebar>
    </div>
  );
}
