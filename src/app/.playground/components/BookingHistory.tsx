'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

type Booking = {
  id: string;
  media_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
};

export const BookingHistory = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/bookings/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clerk_user_id: user.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking history.');
        }

        setBookings(data.bookings);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (!user) {
    return <div>Please log in to view your booking history.</div>;
  }

  if (loading) {
    return <div>Loading booking history...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (bookings.length === 0) {
    return <div>You have no bookings yet.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Booking History</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Media ID</th>
            <th className="border border-gray-300 px-4 py-2">Start Date</th>
            <th className="border border-gray-300 px-4 py-2">End Date</th>
            <th className="border border-gray-300 px-4 py-2">Notes</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="border border-gray-300 px-4 py-2">{booking.media_id}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.start_date}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.end_date}</td>
              <td className="border border-gray-300 px-4 py-2">{booking.notes || 'N/A'}</td>
              <td className="border border-gray-300 px-4 py-2">{new Date(booking.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
