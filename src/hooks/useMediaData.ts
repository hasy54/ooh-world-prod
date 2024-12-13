import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Media {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  availability: boolean;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  code: string | null;
  subtype: string | null;
  geolocation: {
    latitude?: number;
    longitude?: number;
  } | null;
  width: number | null;
  height: number | null;
  city: string | null;
  traffic: string | null;
  photos?: string[];  // Add this new field
}

export function useMediaData() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError('');

        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*');

        if (mediaError) {
          console.error('Error fetching media:', mediaError);
          setError('Unable to fetch media.');
          return;
        }

        setMedia(mediaData || []);
      } catch (err) {
        console.error('Unexpected error fetching media:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return { media, loading, error };
}

