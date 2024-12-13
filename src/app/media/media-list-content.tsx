// src/app/media/media-list-content.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { columns } from "@/components/columns";
import { DataTable } from "@/components/ui/data-table";
import { Stats } from '@/components/stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaDetailsModal } from '@/components/media-details-modal';
import { BookingModal } from '@/components/booking/booking-modal';
import { Button } from '@/components/ui/button';
import { Media } from '@/types/media'; // Import the centralized Media type

export default function MediaList() {
  const { userId } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('available');
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const fetchMedia = async () => {
    if (!userId) {
      setError('User is not logged in.');
      return;
    }

    try {
      setLoading(true);
      setError('');

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

  const handleBookingSubmit = async (data: any) => {
    console.log('Booking submitted:', data);
    setShowBooking(false);
  };

  const filteredMedia = media.filter(m => 
    activeTab === 'available' ? m.availability : !m.availability
  );

  if (loading) {
    return <div className="container mx-auto p-8" role="status" aria-live="polite">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500" role="alert">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">Your Media Listings</h1>
        <div className="space-y-2 md:space-y-0 md:space-x-2">
          <Button onClick={() => setShowBooking(true)} className="w-full md:w-auto mb-2 md:mb-0">
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
          <Button onClick={() => router.push('/media/create')} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Media
          </Button>
        </div>
      </div>

      <Stats media={media} />

      <Tabs defaultValue="available" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="available" className="flex-1 md:flex-none">
            Active Media
            <span className="ml-2 inline-flex items-center justify-center rounded bg-primary/10 px-2 py-0.5 text-xs">
              {media.filter(m => m.availability).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="unavailable" className="flex-1 md:flex-none">
            Inactive Media
            <span className="ml-2 inline-flex items-center justify-center rounded bg-primary/10 px-2 py-0.5 text-xs">
              {media.filter(m => !m.availability).length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="available">
          <DataTable 
            columns={columns} 
            data={filteredMedia} 
            onRowClick={(row) => setSelectedMedia(row as Media)}
          />
        </TabsContent>
        <TabsContent value="unavailable">
          <DataTable 
            columns={columns} 
            data={filteredMedia} 
            onRowClick={(row) => setSelectedMedia(row as Media)}
          />
        </TabsContent>
      </Tabs>

      {selectedMedia && (
        <MediaDetailsModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onUpdate={(updatedMedia) => {
            setMedia(media.map(m => m.id === updatedMedia.id ? updatedMedia : m));
            setSelectedMedia(null);
          }}
          isMyMedia={true}
        />
      )}

      {showBooking && (
        <BookingModal
          onClose={() => setShowBooking(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
}
