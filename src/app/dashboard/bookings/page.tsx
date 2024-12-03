'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import FloatingSidebar from '@/components/ui/FloatingSidebar';

// Define the Booking type
type Booking = {
  id: number;
  client_name: string;
  media: {
    id: number;
    name: string;
    type: string;
    location: string;
    price: number;
    is_available: boolean;
  };
  start_date: string;
  end_date: string;
};

type Media = {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  is_available: boolean;
  bookings: { start_date: string; end_date: string }[];
  nextAvailableDate: Date | null;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]); // Explicit type
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [newBooking, setNewBooking] = useState({
    client_name: '',
    media_ids: [] as number[], // Explicit type for media_ids
    start_date: '',
    interval: '',
  });
  const [estimatedCost, setEstimatedCost] = useState(0);

  const intervals = [
    { label: '15 Days', days: 15 },
    { label: '30 Days', days: 30 },
    { label: '2 Months', days: 60 },
    { label: '3 Months', days: 90 },
  ];

  // Fetch bookings and media
  const fetchBookingsAndMedia = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        console.error('No session found. Redirecting to auth.');
        window.location.href = '/auth';
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Unable to fetch user profile');
      }

      const tenantId = profile.tenant_id;

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          media (id, name, type, location, price, is_available)
        `)
        .eq('tenant_id', tenantId);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw new Error('Unable to fetch bookings');
      }

      setBookings(bookingsData || []);

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select(`
          *,
          bookings (start_date, end_date)
        `)
        .eq('tenant_id', tenantId);

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
        throw new Error('Unable to fetch media');
      }

      const processedMedia = mediaData.map((media: Media) => {
        const upcomingBookings = media.bookings.filter(
          (b) => new Date(b.end_date) > new Date()
        );
        const nextAvailableDate = upcomingBookings.length
          ? new Date(
              Math.max(...upcomingBookings.map((b) => new Date(b.end_date).getTime()))
            )
          : null;

        return {
          ...media,
          nextAvailableDate,
        };
      });

      setAllMedia(processedMedia || []);
    } catch (err: any) {
      console.error('Error in fetchBookingsAndMedia:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndMedia();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li key={booking.id} className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">{booking.client_name}</h2>
            <p>Media: {booking.media.name}</p>
            <p>Type: {booking.media.type}</p>
            <p>Location: {booking.media.location}</p>
            <p>
              Dates: {booking.start_date} to {booking.end_date}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
