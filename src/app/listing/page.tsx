'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { columns } from "@/components/columns"
import { DataTable } from "@/components/ui/data-table"
import { useMediaData } from '@/hooks/useMediaData';
import { Stats } from '@/components/stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaDetailsModal } from '@/components/media-details-modal';
import { BookingModal } from '@/components/booking/booking-modal';
import { Media } from '@/hooks/useMediaData';
import { Button } from '@/components/ui/button';

export default function ListingPage() {
  const { media, loading, error } = useMediaData();
  const [activeTab, setActiveTab] = useState('available');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const handleBookingSubmit = async (data: any) => {
    console.log('Booking submitted:', data)
    setShowBooking(false)
  }

  if (loading) {
    return <div className="container mx-auto p-8" role="status" aria-live="polite">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500" role="alert">{error}</div>;
  }

  const filteredMedia = media.filter(m => 
    activeTab === 'available' ? m.availability : !m.availability
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">All Media Listings</h1>
        <Button onClick={() => setShowBooking(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
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
            // This function needs to be implemented to update the media state
            console.log('Media updated:', updatedMedia);
            setSelectedMedia(null);
          }}
          isMyMedia={false}
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

