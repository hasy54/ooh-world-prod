import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserEmailFromCookie } from '@/utils/jwt';
import { getOAuth2Client } from '@/lib/googleClient';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const email = getUserEmailFromCookie(); // Adjusted: Removed `req` argument.

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user from database
  const { data: user, error } = await supabase
    .from('users')
    .select('access_token, refresh_token')
    .eq('email', email)
    .single();

  if (error || !user?.access_token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      labelIds: ['INBOX'],
    });

    const messages = res.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (m) => {
        if (!m.id) return null;
        const msg = await gmail.users.messages.get({ userId: 'me', id: m.id });
        return {
          id: m.id,
          snippet: msg.data.snippet,
          internalDate: msg.data.internalDate,
        };
      })
    );

    return NextResponse.json(detailedMessages.filter(Boolean));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
