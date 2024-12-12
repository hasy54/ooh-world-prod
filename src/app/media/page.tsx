'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { List as IconList, Grid as IconGrid, Plus as IconPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ListingDetailsDrawer from '@/components/ListingDetailsModal';

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  availability: boolean;
}

export default function MediaList() {
  const { userId } = useAuth(); // Get Clerk's user ID
  const router = useRouter(); // Next.js router
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null); // Selected media for editing
  const [drawerOpen, setDrawerOpen] = useState(false); // Drawer state

  // Fetch media linked to the logged-in user
  const fetchMedia = async () => {
    if (!userId) {
      console.error('User is not logged in.');
      setError('User is not logged in.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch user ID from the users table using Clerk's userId
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        setError('Unable to fetch user details.');
        return;
      }

      const userIdFromDB = user.id;

      // Fetch media linked to the user
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', userIdFromDB);

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

  useEffect(() => {
    fetchMedia();
  }, [userId]);

  // Filter media based on the search term
  const filteredMedia = media.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Media Listings</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button
            variant="ghost"
            onClick={() => setView('list')}
            className={view === 'list' ? 'text-blue-500' : ''}
          >
            <IconList />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setView('grid')}
            className={view === 'grid' ? 'text-blue-500' : ''}
          >
            <IconGrid />
          </Button>
          <Button onClick={() => router.push('/media/create')}> {/* Navigate to Add Media Page */}
            <IconPlus className="mr-2" />
            Add Media
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredMedia.map((m) => (
            <Card
              key={m.id}
              onClick={() => {
                setSelectedMedia(m);
                setDrawerOpen(true);
              }}
              className={`flex cursor-pointer ${
                view === 'list' ? 'items-center justify-between p-4' : 'flex-col text-center p-6'
              }`}
            >
              <div className={view === 'list' ? 'ml-4 flex-1' : 'mt-4'}>
                <h2 className="text-lg font-medium">{m.name}</h2>
                <p className="text-gray-500">{m.location}</p>
                <p className="text-gray-400 text-sm">{m.type}</p>
                <p className="text-gray-400 text-sm">${m.price}</p>
              </div>
              {view === 'list' && (
                <span
                  className={`text-sm font-medium ${
                    m.availability ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {m.availability ? 'Available' : 'Unavailable'}
                </span>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredMedia.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-12">
          <p>No media found matching "{searchTerm}".</p>
        </div>
      )}

      {/* Sidebar Drawer for Editing Listing */}
      {selectedMedia && (
        <ListingDetailsDrawer
          media={selectedMedia}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSave={(updatedMedia) => {
            setMedia((prevMedia) =>
              prevMedia.map((m) => (m.id === updatedMedia.id ? updatedMedia : m))
            );
            setDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}
