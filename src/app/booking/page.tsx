'use client';

import { useState, useEffect } from 'react';
import { useMediaData } from '@/hooks/useMediaData';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const BookPage = () => {
  const { media, loading, error } = useMediaData();
  const { user } = useUser();
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
        ? prev.filter((item) => item.id !== mediaItem.id)
        : [...prev, mediaItem]
    );
  };

  const handlePreview = () => {
    if (!user) {
      alert('You must be logged in to proceed.');
      return;
    }

    const preview = {
      clerk_user_id: user.id,
      mediaIds: selectedMedia.map((item) => item.id),
      startDate,
      endDate,
      notes,
    };

    setPreviewData(preview);
  };

  const handleSubmitToDatabase = async () => {
    if (!previewData) {
      alert('No data to submit. Please preview the data first.');
      return;
    }

    try {
      const response = await fetch('/api/bookings/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`Error: ${data.error}`);
      } else {
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

  

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Book Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional notes..."
                />
              </div>
            </div>

            {/* Media List */}
            <div>
              <h3 className="text-sm font-medium mb-2">Available Media</h3>
              {loading ? (
                <Skeleton className="h-64" />
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="border rounded h-64 overflow-y-auto p-4">
                  <ul className="space-y-2">
                    {media.map((mediaItem) => (
                      <li
                        key={mediaItem.id}
                        className="flex items-center justify-between py-2 border-b"
                      >
                        <div>
                          <strong>Media ID:</strong> {mediaItem.id} <br />
                          <strong>Price:</strong> ${mediaItem.price}
                        </div>
                        <Input
                          type="checkbox"
                          checked={selectedMedia.some((item) => item.id === mediaItem.id)}
                          onChange={() => handleMediaSelection(mediaItem)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <Button variant="secondary" onClick={handlePreview}>
              Preview
            </Button>
            <Button variant="default" onClick={handleSubmitToDatabase}>
              Submit Enquiry
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {previewData && (
  <div className="mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Preview Data</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>
            <strong>User ID:</strong> {previewData.clerk_user_id}
          </li>
          <li>
            <strong>Start Date:</strong> {previewData.startDate}
          </li>
          <li>
            <strong>End Date:</strong> {previewData.endDate}
          </li>
          <li>
            <strong>Notes:</strong> {previewData.notes || 'None'}
          </li>
          <li>
            <strong>Selected Media:</strong>
            <ul className="ml-4 list-disc">
            {previewData.mediaIds.map((id: string, index: number) => (
                <li key={index}>{id}</li>
              ))}
            </ul>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
)}


      {/* Booking History */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-64" />
            ) : historyError ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{historyError}</AlertDescription>
              </Alert>
            ) : bookingHistory.length === 0 ? (
              <div className="text-sm">You have no bookings yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Media ID</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingHistory.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.media_id}</TableCell>
                      <TableCell>{booking.start_date}</TableCell>
                      <TableCell>{booking.end_date}</TableCell>
                      <TableCell>{booking.notes || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(booking.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookPage;
