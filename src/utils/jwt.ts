import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = 'ktseSNs7uWAYzuqBB4aYMtmduuJcf/+8q9DKgd3N9iXo3zXMt+RanApdoU6iyogt36+exAiIDRHbcJc48jBm3g==';

export async function setUserCookie(email: string): Promise<NextResponse> {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

  const response = NextResponse.next();
  response.cookies.set('auth_token', token, { httpOnly: true, secure: false, path: '/' });
  return response;
}

export async function clearUserCookie(): Promise<NextResponse> {
  const response = NextResponse.next();
  response.cookies.delete('auth_token');
  return response;
}

export async function getUserEmailFromCookie(): Promise<string | null> {
  const cookieStore = await cookies(); // Await the cookies() method
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    return decoded.email;
  } catch {
    return null;
  }
}
