'use client';

import { useState, useEffect } from 'react';
import { useMediaData } from '@/hooks/useMediaData';
import { useUser } from '@clerk/nextjs'; // Clerk's `useUser` hook

const BookPage = () => {
  const { media, loading, error } = useMediaData(); // Fetch media list
  const { user } = useUser(); // Get the currently logged-in user from Clerk
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ id: string; price: number }[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  

  const handleMediaSelection = (mediaItem: { id: string; price: number }) => {
    setSelectedMedia((prev) =>
      prev.find((item) => item.id === mediaItem.id)
        ? prev.filter((item) => item.id !== mediaItem.id) // Deselect if already selected
        : [...prev, mediaItem] // Select if not selected
    );
  };

  const handlePreview = () => {
    if (!user) {
      alert('You must be logged in to proceed.');
      return;
    }

    // Create a preview of the data to be sent to the database
    const preview = {
      clerk_user_id: user.id, // Clerk's user ID
      mediaIds: selectedMedia.map((item) => item.id), // Media IDs
      startDate,
      endDate,
      notes,
    };

    console.log('Preview Data:', preview); // Log for debugging
    setPreviewData(preview); // Show on the frontend
  };

  const handleSubmitToDatabase = async () => {
    if (!previewData) {
      alert('No data to submit. Please preview the data first.');
      return;
    }
  
    try {
      const response = await fetch('/api/add/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData),
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.error('Error:', data.error);
        alert(`Error: ${data.error}`);
      } else {
        console.log('Success:', data);
        alert('Enquiries created successfully!');
        setPreviewData(null);
        setSelectedMedia([]);
        setStartDate('');
        setEndDate('');
        setNotes('');
        fetchBookingHistory();
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Check the console for details.');
    }
  };
  

  const fetchBookingHistory = async () => {
    if (!user) return;

    setHistoryLoading(true);
    setHistoryError(null);

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

      setBookingHistory(data.bookings);
    } catch (err: any) {
      setHistoryError(err.message || 'An error occurred.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingHistory();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto p-8" role="status" aria-live="polite">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500" role="alert">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Book Media</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Form Fields */}
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block font-medium mb-1">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes..."
              className="w-full border rounded px-3 py-2 h-24 resize-none"
            />
          </div>
        </div>

        {/* Right Column: Media List */}
        <div>
          <h3 className="font-medium mb-2">Available Media</h3>
          <div className="border rounded h-64 overflow-y-auto p-4">
            <ul className="space-y-2">
              {media.map((mediaItem) => (
                <li key={mediaItem.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedMedia.some((item) => item.id === mediaItem.id)}
                    onChange={() => handleMediaSelection(mediaItem)}
                    className="h-4 w-4"
                  />
                  <span>
                    Media ID: <strong>{mediaItem.id}</strong>, Price: ${mediaItem.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Preview and Submit Buttons */}
        <div className="col-span-1 md:col-span-2 flex justify-between items-center">
          <button
            type="button"
            onClick={handlePreview}
            className="bg-gray-500 text-white rounded py-2 px-4 hover:bg-gray-600"
          >
            Preview Data
          </button>
          <button
            type="button"
            onClick={handleSubmitToDatabase}
            className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600"
          >
            Submit to Database
          </button>
        </div>
      </form>

      {/* Booking History */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Booking History</h2>
        {historyLoading ? (
          <div>Loading booking history...</div>
        ) : historyError ? (
          <div className="text-red-500">{historyError}</div>
        ) : bookingHistory.length === 0 ? (
          <div>You have no bookings yet.</div>
        ) : (
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
              {bookingHistory.map((booking) => (
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
        )}
      </div>
    </div>
  );
};

export default BookPage;
