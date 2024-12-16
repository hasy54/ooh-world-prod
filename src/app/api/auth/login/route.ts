import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from '@/lib/googleClient';

export async function GET(req: NextRequest) {
  const oauth2Client = getOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'openid',
      'email',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    prompt: 'consent'
  });

  return NextResponse.redirect(authUrl);
}
