import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/googleClient';
import { setUserCookie } from '@/utils/jwt';

export async function GET(req: NextRequest) {
  try {
    const authCode = req.nextUrl.searchParams.get('code');
    if (!authCode) {
      return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
    }

    // Exchange the authorization code for tokens
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(authCode);

    const { access_token, refresh_token, expiry_date, id_token } = tokens;
    const oauth2ClientWithCredentials = oauth2Client;
    oauth2ClientWithCredentials.setCredentials(tokens);

    const googleAuth = google.oauth2('v2');
    const { data: userInfo } = await googleAuth.userinfo.get({ auth: oauth2ClientWithCredentials });

    const { email, name } = userInfo;

    if (!email) {
      return NextResponse.json({ error: 'Failed to retrieve email' }, { status: 500 });
    }

    // Upsert user into Supabase
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          email,
          name,
          access_token,
          refresh_token,
          token_expiry_date: expiry_date ? new Date(expiry_date) : null,
        },
        { onConflict: 'email' }
      );

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      return NextResponse.json({ error: 'Database upsert failed' }, { status: 500 });
    }

    // Set cookie
    return setUserCookie(email);
  } catch (error) {
    console.error('Callback route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
