import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface BookingFormModalProps {
  selectedMedia: string[];
  onClose: () => void;
}

export default function BookingFormModal({
  selectedMedia,
  onClose,
}: BookingFormModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    setLoading(true);
    try {
      console.log('Selected Media:', selectedMedia);
      console.log('Start Date:', startDate, 'End Date:', endDate);
  
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaIds: selectedMedia,
          startDate,
          endDate,
        }),
      });
  
      const result = await response.json();
      console.log('API Response:', result);
  
      if (result.success) {
        alert('Booking request submitted successfully!');
        onClose();
      } else {
        alert(result.error || 'Failed to submit booking request.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4">Confirm Booking</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={loading || !startDate || !endDate}>
            {loading ? 'Submitting...' : 'Submit Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
}
