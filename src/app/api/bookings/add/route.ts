import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { clerk_user_id, mediaIds, startDate, endDate, notes } = await req.json();

    // Log incoming request body
    console.log('Incoming request body:', { clerk_user_id, mediaIds, startDate, endDate, notes });

    // Validate required fields
    if (!clerk_user_id || !mediaIds || mediaIds.length === 0 || !startDate || !endDate) {
      console.error('Missing required fields:', { clerk_user_id, mediaIds, startDate, endDate });
      return NextResponse.json(
        { error: 'Missing required fields. Ensure clerk_user_id, mediaIds, startDate, and endDate are provided.' },
        { status: 400 }
      );
    }
        // Insert a single grouped booking into the `bookings` table
        const { error: bookingError } = await supabase.from('bookings').insert({
          clerk_user_id,
          media_id: JSON.stringify(mediaIds), // Store mediaIds as JSON
          start_date: startDate,
          end_date: endDate,
          notes,
          created_at: new Date().toISOString(), // Use server time for created_at
        });

    // Process each mediaId and create a booking
    const bookingPromises = mediaIds.map(async (mediaId: string) => {
      // Insert booking into the `bookings` table
      const { error: bookingError } = await supabase.from('bookings').insert({
        clerk_user_id,
        media_id: mediaId,
        start_date: startDate,
        end_date: endDate,
        notes,
        created_at: new Date().toISOString(), // Use server time for created_at
      });

      if (bookingError) {
        console.error(`Failed to create booking for media ID ${mediaId}:`, bookingError.message);
        throw new Error(`Failed to create booking for media ID ${mediaId}`);
      }

      console.log(`Booking created for media ID ${mediaId}`);
    });

    // Wait for all bookings to complete
    await Promise.all(bookingPromises);

    console.log('All bookings created successfully');
    return NextResponse.json({ success: true, message: 'Bookings created successfully' });
  } catch (error: any) {
    console.error('Error creating bookings:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking enquiry' },
      { status: 500 }
    );
  }
}
