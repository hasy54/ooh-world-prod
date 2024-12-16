'use client';

import { useState, useEffect } from 'react';

export const MediaOwnerBookings = ({ ownerId }: { ownerId: string }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/bookings/owner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ownerId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch bookings.');
        }

        setBookings(data.bookings);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [ownerId]);

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch('/api/update/booking-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status, ownerId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      alert('Booking status updated successfully!');
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Enquiries</h2>
      {bookings.length === 0 ? (
        <div>No enquiries found.</div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Media ID</th>
              <th className="border border-gray-300 px-4 py-2">Start Date</th>
              <th className="border border-gray-300 px-4 py-2">End Date</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="border border-gray-300 px-4 py-2">{booking.media_id}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.start_date}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.end_date}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.status}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => updateStatus(booking.id, 'approved')}
                    className="bg-green-500 text-white rounded px-2 py-1 mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(booking.id, 'rejected')}
                    className="bg-red-500 text-white rounded px-2 py-1"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
