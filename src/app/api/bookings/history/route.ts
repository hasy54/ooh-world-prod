import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { clerk_user_id } = await req.json();

    // Validate the input
    if (!clerk_user_id) {
      return NextResponse.json(
        { error: 'Missing required field: clerk_user_id' },
        { status: 400 }
      );
    }

    // Fetch booking history for the user
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, media_id, start_date, end_date, notes, created_at')
      .eq('clerk_user_id', clerk_user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch booking history.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking history.' },
      { status: 500 }
    );
  }
}
