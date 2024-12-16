import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { clearUserCookie } from '@/utils/jwt';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  return handleLogout(req);
}

export async function POST(req: NextRequest) {
  return handleLogout(req);
}

// Shared logout logic
async function handleLogout(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: 'Clerk User ID is missing' }, { status: 401 });
    }

    // Clear tokens in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        access_token: null,
        refresh_token: null,
        token_expiry_date: null,
      })
      .eq('clerk_user_id', userId);

    if (error) {
      console.error('Failed to clear tokens:', error);
      return NextResponse.json({ error: 'Failed to clear user tokens' }, { status: 500 });
    }

    // Clear cookies
    clearUserCookie();

    // Redirect to homepage
    return NextResponse.redirect('/mail');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Logout route error:', error.message);
      return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } else {
      console.error('Logout route error:', error);
      return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
    }
  }
}
