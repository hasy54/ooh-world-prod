'use client';

import { useEffect, useState } from 'react';

type Booking = {
  id: string;
  media: {
    name: string;
  };
  client_name: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  group_id?: string; // Optional property
};

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]); // Add a type for bookings
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bookings based on the status filter
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings?status=${statusFilter}`);
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  return (
    <div>
      <h1>Bookings</h1>

      {/* Filter Dropdown */}
      <div>
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Booking List */}
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length > 0 ? (
        <ul>
          {bookings.map((booking) => (
            <li
              key={booking.id}
              style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}
            >
              <h3>Media Name: {booking.media.name}</h3>
              <p>Client: {booking.client_name}</p>
              <p>Dates: {booking.start_date} to {booking.end_date}</p>
              <p>Total Price: ${booking.total_price}</p>
              <p>Status: {booking.status}</p>
              {booking.group_id && <p>Group ID: {booking.group_id}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings available.</p>
      )}
    </div>
  );
}
