'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Media {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  availability: boolean;
}

export default function UserInfo() {
  const { userId: clerkUserId } = useAuth();
  const [supabaseId, setSupabaseId] = useState<string | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch Supabase ID
  useEffect(() => {
    async function fetchSupabaseId() {
      try {
        if (!clerkUserId) {
          console.error('Clerk User ID is null. User might not be logged in.');
          setError('User is not logged in');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .single();

        if (error) {
          console.error('Error fetching Supabase ID:', error);
          setError('Unable to fetch Supabase ID');
          return;
        }

        if (data?.id) {
          setSupabaseId(data.id);
        } else {
          setError('No Supabase ID found for the user.');
        }
      } catch (err) {
        console.error('Unexpected error in fetchSupabaseId:', err);
        setError('An unexpected error occurred');
      }
    }

    if (clerkUserId) {
      fetchSupabaseId();
    }
  }, [clerkUserId]);

  // Fetch Media associated with Supabase ID
useEffect(() => {
    async function fetchMedia() {
      try {
        if (!supabaseId) {
          console.error('Supabase ID is null. Cannot fetch media.');
          return;
        }
  
        console.log('Fetching media for Supabase ID:', supabaseId);
  
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .eq('user_id', supabaseId);
  
        if (error) {
          console.error('Error fetching media:', error);
          setError('Unable to fetch media');
          return;
        }
  
        console.log('Fetched media:', data);
        setMedia(data || []);
      } catch (err) {
        console.error('Unexpected error in fetchMedia:', err);
        setError('An unexpected error occurred while fetching media');
      }
    }
  
    if (supabaseId) {
      fetchMedia();
    }
  }, [supabaseId]);
  
  console.log('Clerk User ID:', clerkUserId);
  console.log('Supabase ID:', supabaseId);
  console.log('Media:', media);
  console.log('Error:', error);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Information</h1>
      {!clerkUserId ? (
        <p className="text-red-500">User is not logged in.</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : supabaseId ? (
        <div className="space-y-4">
          <div>
            <p>
              <strong>Clerk User ID:</strong> {clerkUserId}
            </p>
            <p>
              <strong>Supabase User ID:</strong> {supabaseId}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold">Media List</h2>
            {media.length > 0 ? (
              <ul className="space-y-2">
                {media.map((m) => (
                  <li key={m.id} className="border p-2 rounded">
                    <p>
                      <strong>Media ID:</strong> {m.id}
                    </p>
                    <p>
                      <strong>Name:</strong> {m.name}
                    </p>
                    <p>
                      <strong>Type:</strong> {m.type}
                    </p>
                    <p>
                      <strong>Location:</strong> {m.location}
                    </p>
                    <p>
                      <strong>Price:</strong> ${m.price}
                    </p>
                    <p>
                      <strong>Availability:</strong>{' '}
                      {m.availability ? 'Available' : 'Unavailable'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No media associated with this user.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
}
