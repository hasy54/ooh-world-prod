import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';
import { getOAuth2Client } from '@/lib/googleClient';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req); // Fetch Clerk User ID
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch tokens from database
  const { data: user, error } = await supabase
    .from('users')
    .select('access_token, refresh_token')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !user?.access_token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Set up Google OAuth2 client
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  });

  try {
    // Fetch messages
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 100,
      labelIds: ['INBOX'],
    });

    const messages = res.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (m) => {
        if (!m.id) return null;
        const msg = await gmail.users.messages.get({ userId: 'me', id: m.id });

        // Extract useful headers
        const headers = msg.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((header) => header.name === name)?.value || 'No Data';


        return {
          id: m.id,
          snippet: msg.data.snippet,
          internalDate: msg.data.internalDate,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          date: getHeader('Date'),
        };
      })
    );

    return NextResponse.json(detailedMessages.filter(Boolean));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
