import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId, mediaIds, startDate, endDate } = await req.json();

    // Log incoming request body
    console.log('Incoming request body:', { userId, mediaIds, startDate, endDate });

    // Validate required fields
    if (!userId || !mediaIds || !startDate || !endDate) {
      console.error('Missing required fields:', { userId, mediaIds, startDate, endDate });
      return NextResponse.json(
        { error: 'Missing required fields. Ensure userId, mediaIds, startDate, and endDate are provided.' },
        { status: 400 }
      );
    }

    // Fetch the user from the `users` table using Clerk's userId
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return NextResponse.json(
        { error: 'User not found in the database.' },
        { status: 404 }
      );
    }

    console.log('User fetched:', user);

    // Generate a unique group ID for grouped bookings
    const groupId = crypto.randomUUID();

    // Process each mediaId and create a booking
    const bookingPromises = mediaIds.map(async (mediaId: string) => {
      // Fetch the media owner (user_id) from the `media` table
      const { data: media, error: mediaError } = await supabase
        .from('media')
        .select('user_id')
        .eq('id', mediaId)
        .single();

      if (mediaError || !media) {
        throw new Error(`Media with ID ${mediaId} not found`);
      }

      console.log('Media fetched:', media);

      // Insert booking into the `bookings` table
      const { error: bookingError } = await supabase.from('bookings').insert({
        client_name: user.name,
        client_email: user.email,
        media_id: mediaId,
        start_date: startDate,
        end_date: endDate,
        total_price: 1000, // Replace with your pricing logic
        status: 'pending',
        group_id: groupId,
        owner_id: media.user_id,
        created_at: new Date().toISOString(),
      });

      if (bookingError) {
        throw new Error(
          `Failed to create booking for media ID ${mediaId}: ${bookingError.message}`
        );
      }

      console.log(`Booking created for media ID ${mediaId}`);
    });

    // Wait for all bookings to complete
    await Promise.all(bookingPromises);

    return NextResponse.json({ success: true, message: 'Bookings created successfully' });
  } catch (error: any) {
    console.error('Error creating bookings:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking enquiry' },
      { status: 500 }
    );
  }
}
