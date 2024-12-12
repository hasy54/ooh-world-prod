import { NextResponse } from 'next/server';
import { clearUserCookie } from '@/utils/jwt';

export async function GET() {
  clearUserCookie();
  return NextResponse.redirect('/');
}
