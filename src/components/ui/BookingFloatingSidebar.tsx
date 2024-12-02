import React from 'react';

export default function BookingFloatingSidebar({
  isOpen,
  onClose,
  booking,
  isAddBooking,
  newBooking,
  setNewBooking,
  availableMedia,
  intervals,
  estimatedCost,
  calculateEstimate,
  fetchBookings,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking?: unknown;
  isAddBooking?: boolean;
  newBooking?: unknown;
  setNewBooking?: (data: unknown) => void;
  availableMedia?: unknown[];
  intervals?: unknown[];
  estimatedCost?: number;
  calculateEstimate?: () => void;
  fetchBookings?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold">{isAddBooking ? 'Add Booking' : 'Booking Details'}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          Close
        </button>
      </div>
      <div className="p-4 overflow-y-auto">
        {isAddBooking ? (
          <div>
            <input
              type="text"
              placeholder="Client Name"
              value={newBooking.client_name}
              onChange={(e) =>
                setNewBooking({ ...newBooking, client_name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <select
              value={newBooking.interval}
              onChange={(e) =>
                setNewBooking({ ...newBooking, interval: e.target.value })
              }
              className="w-full px-4 py-2 border rounded mb-4"
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
                setNewBooking({ ...newBooking, start_date: e.target.value })
              }
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <ul className="space-y-2 mb-4">
              {availableMedia.map((media) => (
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
                        calculateEstimate();
                      }}
                    />{' '}
                    {media.name} (${media.price}/day)
                  </label>
                </li>
              ))}
            </ul>
            <div className="text-gray-600 mb-4">
              <strong>Estimated Cost:</strong> ${estimatedCost}
            </div>
            <button
              onClick={async () => {
                await fetchBookings();
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600"
            >
              Add Booking
            </button>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">{booking.client_name}</h3>
            <p>
              Dates: {booking.start_date} to {booking.end_date}
            </p>
            <h4 className="mt-4 font-semibold">Media Details:</h4>
            {booking.bookings?.map((b: unknown) => (
              <div key={b.id} className="p-2 bg-gray-100 rounded mb-2">
                <p>Media: {b.media.name}</p>
                <p>Type: {b.media.type}</p>
                <p>Location: {b.media.location}</p>
                <p>Price: ${b.media.price}/day</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
