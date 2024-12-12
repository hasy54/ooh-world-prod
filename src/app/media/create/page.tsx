'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AddMedia() {
  const { userId } = useAuth(); // Clerk User ID
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    location: '',
    type: '',
    price: '',
    availability: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      setError('User is not logged in.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch the Supabase user ID using Clerk User ID
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();

      if (userError || !user) {
        console.error('Error fetching user ID:', userError);
        setError('Unable to fetch user details.');
        return;
      }

      const userIdFromDB = user.id;

      // Insert the new media
      const { error: mediaError } = await supabase.from('media').insert({
        name: form.name,
        location: form.location,
        type: form.type,
        price: Number(form.price),
        availability: form.availability,
        user_id: userIdFromDB,
      });

      if (mediaError) {
        console.error('Error adding media:', mediaError);
        setError('Failed to create new media.');
        return;
      }

      // Navigate back to the media list
      router.push('/media'); // Replace with your media list route
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Media</h1>
      <div className="space-y-4">
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <Input
          placeholder="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.checked })}
          />
          <span>Available</span>
        </label>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => router.push('/media-list')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Media'}
          </Button>
        </div>
      </div>
    </div>
  );
}
