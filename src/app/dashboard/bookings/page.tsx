'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import FloatingSidebar from '@/components/ui/FloatingSidebar';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [newBooking, setNewBooking] = useState({
    client_name: '',
    media_ids: [] as number[],
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

  const calculateEstimate = () => {
    if (!newBooking.start_date || !newBooking.interval || newBooking.media_ids.length === 0) {
      setEstimatedCost(0);
      return;
    }

    const intervalDays =
      intervals.find((i) => i.label === newBooking.interval)?.days || 0;

    const totalCost = newBooking.media_ids.reduce((acc, mediaId) => {
      const media = allMedia.find((m) => m.id === mediaId);
      return acc + (media ? media.price * intervalDays : 0);
    }, 0);

    setEstimatedCost(totalCost);
  };

  const handleAddBooking = async () => {
    try {
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

      const intervalDays =
        intervals.find((i) => i.label === newBooking.interval)?.days || 0;
      const endDate = new Date(newBooking.start_date);
      endDate.setDate(endDate.getDate() + intervalDays);

      for (const mediaId of newBooking.media_ids) {
        const { error: bookingError } = await supabase.from('bookings').insert({
          media_id: mediaId,
          start_date: newBooking.start_date,
          end_date: endDate.toISOString().split('T')[0],
          tenant_id: profile.tenant_id,
          client_name: newBooking.client_name,
        });

        if (bookingError) throw new Error('Failed to add booking');

        await supabase.from('media').update({ is_available: false }).eq('id', mediaId);
      }

      setIsSidebarOpen(false);
      setNewBooking({ client_name: '', media_ids: [], start_date: '', interval: '' });
      setEstimatedCost(0);
      fetchBookingsAndMedia();
    } catch (err: any) {
      console.error('Error in handleAddBooking:', err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBookingsAndMedia();
  }, []);

  useEffect(() => {
    calculateEstimate();
  }, [newBooking.start_date, newBooking.interval, newBooking.media_ids]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600"
      >
        Add New Booking
      </button>
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
