'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import FloatingSidebar from '@/components/ui/FloatingSidebar';
import Image from 'next/image';

interface MediaImage {
  image_url: string;
}

interface MediaItem {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  availability: boolean;
  media_images: MediaImage[];
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [newMedia, setNewMedia] = useState({
    name: '',
    type: '',
    location: '',
    price: '',
    availability: true,
  });
  const [newImages, setNewImages] = useState<File[]>([]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        window.location.href = '/auth';
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError || !profile) {
        setError('Unable to fetch user profile');
        return;
      }

      const { data: mediaData } = await supabase
        .from('media')
        .select(`
          *,
          media_images (image_url)
        `)
        .eq('tenant_id', profile.tenant_id);

      setMedia(mediaData || []);
    } catch {
      setError('Error fetching media');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        window.location.href = '/auth';
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError || !profile) {
        setError('Unable to fetch user profile');
        return;
      }

      const { data: insertedMedia } = await supabase
        .from('media')
        .insert({ ...newMedia, tenant_id: profile.tenant_id })
        .select()
        .single();

      for (const image of newImages) {
        const filePath = `${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
        await supabase.storage.from('media-images').upload(filePath, image);

        const { data: publicUrlData } = supabase.storage
          .from('media-images')
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error('Failed to retrieve image public URL');
        }

        await supabase.from('media_images').insert({
          media_id: insertedMedia.id,
          image_url: publicUrlData.publicUrl,
        });
      }

      setIsSidebarOpen(false);
      setNewMedia({ name: '', type: '', location: '', price: '', availability: true });
      setNewImages([]);
      fetchMedia();
    } catch {
      setError('Error adding media');
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
                  <Image
                    key={idx}
                    src={img.image_url}
                    alt={`Media ${item.name}`}
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <FloatingSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Add New Media</h2>
        <input
          type="text"
          placeholder="Name"
          value={newMedia.name}
          onChange={(e) => setNewMedia({ ...newMedia, name: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
        <button
          onClick={handleAddMedia}
          className="px-4 py-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600"
        >
          Add Media
        </button>
      </FloatingSidebar>
    </div>
  );
}
