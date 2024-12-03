// src/components/PublicMediaPage.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

interface MediaImage {
  image_url: string;
}

interface MediaItem {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  media_images?: MediaImage[];
}

interface PublicMediaPageProps {
  params: {
    tenantId: string;
  };
}

const PublicMediaPage: React.FC<PublicMediaPageProps> = ({ params }) => {
  const { tenantId } = params;
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      // Fetch media items from Supabase or your data source
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select(`
          *,
          media_images (image_url)
        `)
        .eq('tenant_id', tenantId);

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
        throw new Error('Unable to fetch media');
      }

      setMediaItems((mediaData as MediaItem[]) || []);
    } catch (err: any) {
      console.error('Error in fetchMediaItems:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaItems();
  }, [tenantId]);

  if (loading) return <div>Loading media items...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Media for Tenant {tenantId}</h1>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mediaItems.map((item) => (
          <li key={item.id} className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p>Type: {item.type}</p>
            <p>Location: {item.location}</p>
            <p>Price: ${item.price}</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Images</h3>
              <div className="flex space-x-4 overflow-x-auto">
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
            {/* You can add more content or actions here */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicMediaPage;
