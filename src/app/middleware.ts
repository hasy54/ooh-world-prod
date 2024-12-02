import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
    request.headers.set('x-subdomain', subdomain); // Pass the subdomain to the app
  }

  return NextResponse.next();
}
