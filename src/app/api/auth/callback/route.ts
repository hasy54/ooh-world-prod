import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/googleClient';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch Clerk User ID from session
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Clerk User ID is missing' }, { status: 401 });
    }

    // 2. Retrieve the authorization code from the query parameters
    const authCode = req.nextUrl.searchParams.get('code');
    if (!authCode) {
      return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
    }

    // 3. Exchange the auth code for tokens using Google's OAuth2 client
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(authCode);

    const { access_token, refresh_token, expiry_date } = tokens;
    oauth2Client.setCredentials(tokens);

    // 4. Retrieve user information from Google
    const googleAuth = google.oauth2('v2');
    const { data: userInfo } = await googleAuth.userinfo.get({ auth: oauth2Client });
    const { name } = userInfo;

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Failed to fetch Google tokens' }, { status: 500 });
    }

    // 5. Upsert user information into the Supabase `users` table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          clerk_user_id: userId, // Use Clerk User ID for uniqueness
          name: name || 'Google User', // Use a fallback name if not provided
          access_token,
          refresh_token,
          token_expiry_date: expiry_date ? new Date(expiry_date) : null,
        },
        { onConflict: 'clerk_user_id' }
      );

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError.message);
      return NextResponse.json({ error: 'Database upsert failed', details: upsertError.message }, { status: 500 });
    }

    // 6. Redirect user to the home page after successful login
    return NextResponse.redirect(new URL('/mail', req.url));
  } catch (error) {
    // Ensure `error` is an instance of `Error`
    if (error instanceof Error) {
      console.error('Callback route error:', error.message);
      return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } else {
      // Handle non-Error objects gracefully
      console.error('Callback route error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
