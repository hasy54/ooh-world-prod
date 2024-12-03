'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import FloatingSidebar from '@/components/ui/FloatingSidebar';

// Define interfaces for your data
interface Booking {
  id: number;
  client_name: string;
  start_date: string;
  end_date: string;
  media: Media;
}

interface Media {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  is_available: boolean;
  nextAvailableDate?: Date | null;
  bookings: Booking[];
}

interface NewBooking {
  client_name: string;
  media_ids: number[];
  start_date: string;
  interval: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]); // List of bookings
  const [allMedia, setAllMedia] = useState<Media[]>([]); // All media (available + unavailable)
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar visibility

  const [newBooking, setNewBooking] = useState<NewBooking>({
    client_name: '',
    media_ids: [], // Array for multiple media selection
    start_date: '',
    interval: '', // Booking interval
  }); // New booking form data
  const [estimatedCost, setEstimatedCost] = useState(0); // Estimated cost

  const intervals = [
    { label: '15 Days', days: 15 },
    { label: '30 Days', days: 30 },
    { label: '2 Months', days: 60 },
    { label: '3 Months', days: 90 },
  ]; // Predefined booking intervals

  // Fetch all bookings and media
  const fetchBookingsAndMedia = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found. Redirecting to auth.');
        window.location.href = '/auth';
        return;
      }

      // Fetch tenant ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Unable to fetch user profile');
      }

      console.log('Fetched tenant ID:', profile.tenant_id);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(
          `
          *,
          media (id, name, type, location, price, is_available)
        `
        )
        .eq('tenant_id', profile.tenant_id);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw new Error('Unable to fetch bookings');
      }

      console.log('Fetched bookings:', bookingsData);
      setBookings((bookingsData as Booking[]) || []);

      // Fetch all media (available + unavailable)
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select(`
          *,
          bookings (
            start_date,
            end_date
          )
        `)
        .eq('tenant_id', profile.tenant_id);

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
        throw new Error('Unable to fetch media');
      }

      console.log('Fetched all media:', mediaData);

      // Process media to include availability info
      const processedMedia: Media[] = (mediaData as Media[]).map((media) => {
        const upcomingBookings = media.bookings.filter(
          (b) => new Date(b.end_date) > new Date()
        );
        const nextAvailableDate =
          upcomingBookings.length > 0
            ? new Date(
                Math.max(
                  ...upcomingBookings.map((b) => new Date(b.end_date).getTime())
                )
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

  // Calculate estimated cost and end date
  const calculateEstimate = () => {
    if (
      !newBooking.start_date ||
      !newBooking.interval ||
      newBooking.media_ids.length === 0
    ) {
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
    console.log('Calculated estimate:', { totalCost });
  };

  // Handle booking creation
  const handleAddBooking = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found. Redirecting to auth.');
        window.location.href = '/auth';
        return;
      }

      // Fetch tenant ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Unable to fetch user profile');
      }

      // Calculate end date
      const intervalDays =
        intervals.find((i) => i.label === newBooking.interval)?.days || 0;
      const endDate = new Date(newBooking.start_date);
      endDate.setDate(endDate.getDate() + intervalDays);

      // Insert bookings for each selected media
      for (const mediaId of newBooking.media_ids) {
        const { error: bookingError } = await supabase.from('bookings').insert({
          media_id: mediaId,
          start_date: newBooking.start_date,
          end_date: endDate.toISOString().split('T')[0],
          tenant_id: profile.tenant_id,
          client_name: newBooking.client_name,
        });

        if (bookingError) {
          console.error('Error adding booking:', bookingError);
          throw new Error('Failed to add booking');
        }

        // Mark media as unavailable
        const { error: updateMediaError } = await supabase
          .from('media')
          .update({ is_available: false })
          .eq('id', mediaId);

        if (updateMediaError) {
          console.error('Error updating media availability:', updateMediaError);
          throw new Error('Failed to update media availability');
        }
      }

      console.log('All bookings added successfully.');

      // Reset form and refresh data
      setIsSidebarOpen(false);
      setNewBooking({
        client_name: '',
        media_ids: [],
        start_date: '',
        interval: '',
      });
      setEstimatedCost(0);
      fetchBookingsAndMedia();
    } catch (err: any) {
      console.error('Error in handleAddBooking:', err.message);
      setError(err.message);
    }
  };

  // Handle booking deletion (cancellation)
  const handleDeleteBooking = async (bookingId: number, mediaId: number) => {
    try {
      // Delete the booking
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (deleteError) {
        console.error('Error deleting booking:', deleteError);
        throw new Error('Failed to delete booking');
      }

      // Mark media as available
      const { error: updateMediaError } = await supabase
        .from('media')
        .update({ is_available: true })
        .eq('id', mediaId);

      if (updateMediaError) {
        console.error('Error updating media availability:', updateMediaError);
        throw new Error('Failed to update media availability');
      }

      console.log('Booking deleted successfully, media is now available.');

      // Refresh data
      fetchBookingsAndMedia();
    } catch (err: any) {
      console.error('Error in handleDeleteBooking:', err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBookingsAndMedia();
  }, []);

  useEffect(() => {
    calculateEstimate();
  }, [newBooking.start_date, newBooking.interval, newBooking.media_ids]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Bookings</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600"
          >
            Add New Booking
          </button>
          <ul className="space-y-4">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className={`p-4 bg-white shadow rounded ${
                  booking.media.is_available ? '' : 'opacity-50'
                }`}
              >
                <h2 className="text-xl font-semibold">
                  {booking.client_name}
                </h2>
                <p>Media: {booking.media.name}</p>
                <p>Type: {booking.media.type}</p>
                <p>Location: {booking.media.location}</p>
                <p>
                  Dates: {booking.start_date} to {booking.end_date}
                </p>
                <button
                  onClick={() =>
                    handleDeleteBooking(booking.id, booking.media.id)
                  }
                  className="px-4 py-2 bg-red-500 text-white rounded-md mt-2 hover:bg-red-600"
                >
                  Cancel Booking
                </button>
              </li>
            ))}
          </ul>

          <FloatingSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          >
            <h2 className="text-xl font-bold mb-4">Add New Booking</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Client Name"
                value={newBooking.client_name}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, client_name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
              />
              <select
                value={newBooking.interval}
                onChange={(e) =>
                  setNewBooking({ ...newBooking, interval: e.target.value })
                }
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select Interval</option>
                {intervals.map((interval) => (
                  <option key={interval.label} value={interval.label}>
                    {interval.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newBooking.start_date}
                onChange={(e) =>
                  setNewBooking({
                    ...newBooking,
                    start_date: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded"
              />
              <div>
                <label>Select Media</label>
                <ul className="space-y-2">
                  {allMedia.map((media) => (
                    <li key={media.id}>
                      <label>
                        <input
                          type="checkbox"
                          value={media.id}
                          checked={newBooking.media_ids.includes(media.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNewBooking((prev) => ({
                              ...prev,
                              media_ids: checked
                                ? [...prev.media_ids, media.id]
                                : prev.media_ids.filter((id) => id !== media.id),
                            }));
                          }}
                          disabled={!media.is_available}
                        />{' '}
                        {media.name} (${media.price}/day)
                        {!media.is_available && (
                          <span>
                            Available from:{' '}
                            {new Date(
                              media.nextAvailableDate!
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-gray-600">
                <strong>Estimated Cost:</strong> ${estimatedCost}
              </div>
              <button
                onClick={handleAddBooking}
                className="px-4 py-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600"
              >
                Add Booking
              </button>
            </div>
          </FloatingSidebar>
        </>
      )}
    </div>
  );
}
