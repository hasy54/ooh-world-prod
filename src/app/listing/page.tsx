'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { List as IconList, Grid as IconGrid } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import BookingFormModal from '@/components/BookingForm'; // Form for multiple media booking

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  availability: boolean;
  user_id: string;
}

export default function ListingPage() {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]); // Track selected media
  const [showBookingForm, setShowBookingForm] = useState(false); // Toggle form visibility

  // Fetch all media from the database
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

  useEffect(() => {
    fetchMedia();
  }, []);

  // Filter media based on the search term
  const filteredMedia = media.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMediaSelection = (id: string) => {
    setSelectedMedia((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">All Media Listings</h1>
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
              className={`flex ${
                view === 'list' ? 'items-center justify-between p-4' : 'flex-col text-center p-6'
              }`}
            >
              <div className={view === 'list' ? 'ml-4 flex-1' : 'mt-4'}>
                <h2 className="text-lg font-medium">{m.name}</h2>
                <p className="text-gray-500">{m.location}</p>
                <p className="text-gray-400 text-sm">{m.type}</p>
                <p className="text-gray-400 text-sm">${m.price}</p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedMedia.includes(m.id)}
                  onChange={() => toggleMediaSelection(m.id)}
                />
                <span>Select</span>
              </label>
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

      {/* Add New Booking Button */}
      <div className="mt-6">
        <Button
          onClick={() => setShowBookingForm(true)}
          disabled={selectedMedia.length === 0}
        >
          Add New Booking
        </Button>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingFormModal
          selectedMedia={selectedMedia}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </div>
  );
}
